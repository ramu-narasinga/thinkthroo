import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { eq, and, sql } from 'drizzle-orm';
import { serverDB } from '@/database';
import { installations, organizations, creditTransactions, aiUsageLogs } from '@/database/schemas';

const BASE_CREDITS_PER_DOLLAR = 10;
const AI_MARKUP_MULTIPLIER = Number(process.env.AI_MARKUP_MULTIPLIER ?? 3);
const CREDITS_PER_DOLLAR = BASE_CREDITS_PER_DOLLAR * AI_MARKUP_MULTIPLIER;

/** USD per 1 million tokens for each supported model */
const MODEL_PRICING_USD_PER_MILLION: Record<string, { input: number; output: number }> = {
  'claude-haiku-4-5-20251001': { input: 0.8, output: 4.0 },
  'claude-sonnet-4-5-20250929': { input: 3.0, output: 15.0 },
};

const FALLBACK_PRICING = { input: 3.0, output: 15.0 };

interface UsageEntry {
  model: string;
  inputTokens: number;
  outputTokens: number;
}

function calculateCostUsd(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING_USD_PER_MILLION[model] ?? FALLBACK_PRICING;
  return (inputTokens * pricing.input) / 1_000_000 + (outputTokens * pricing.output) / 1_000_000;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret');
  const expected = process.env.PLATFORM_API_SECRET;
  if (!secret || !expected || !timingSafeEqual(Buffer.from(secret), Buffer.from(expected))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    installationId?: string;
    repositoryFullName?: string;
    prNumber?: number;
    usage?: UsageEntry[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { installationId, repositoryFullName, prNumber, usage } = body;

  if (!installationId || !repositoryFullName || prNumber == null || !Array.isArray(usage)) {
    return NextResponse.json(
      { error: 'installationId, repositoryFullName, prNumber, and usage[] are required' },
      { status: 400 },
    );
  }

  // Resolve installation → org
  const [installation] = await serverDB
    .select({ githubOrgId: installations.githubOrgId, userId: installations.userId })
    .from(installations)
    .where(eq(installations.installationId, installationId))
    .limit(1);

  if (!installation) {
    return NextResponse.json({ error: 'Installation not found' }, { status: 404 });
  }

  const [org] = await serverDB
    .select({ id: organizations.id, creditBalance: organizations.creditBalance })
    .from(organizations)
    .where(
      and(
        eq(organizations.githubOrgId, installation.githubOrgId),
        eq(organizations.userId, installation.userId),
      ),
    )
    .limit(1);

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  // Aggregate usage entries by model, filter empty entries
  const aggregated: Record<string, { inputTokens: number; outputTokens: number }> = {};
  for (const entry of usage) {
    if (!entry.model || (entry.inputTokens === 0 && entry.outputTokens === 0)) continue;
    if (!aggregated[entry.model]) {
      aggregated[entry.model] = { inputTokens: 0, outputTokens: 0 };
    }
    aggregated[entry.model].inputTokens += entry.inputTokens;
    aggregated[entry.model].outputTokens += entry.outputTokens;
  }

  // Calculate total cost and credits
  let totalCostUsd = 0;
  for (const [model, tokens] of Object.entries(aggregated)) {
    totalCostUsd += calculateCostUsd(model, tokens.inputTokens, tokens.outputTokens);
  }
  const totalCreditsToDeduct = totalCostUsd * CREDITS_PER_DOLLAR;

  if (totalCreditsToDeduct === 0) {
    return NextResponse.json({ success: true, creditsDeducted: 0, newBalance: Number(org.creditBalance) });
  }

  const currentBalance = Number(org.creditBalance);
  if (currentBalance < totalCreditsToDeduct) {
    return NextResponse.json({
      success: false,
      reason: 'insufficient_credits',
      currentBalance,
      creditsRequired: totalCreditsToDeduct,
    });
  }

  const newBalance = currentBalance - totalCreditsToDeduct;

  // Persist: update org balance + insert credit transaction + insert ai_usage_logs
  const [creditTx] = await serverDB
    .insert(creditTransactions)
    .values({
      organizationId: org.id,
      transactionType: 'ai_usage',
      amount: String(-totalCreditsToDeduct),
      balanceAfter: String(newBalance),
      referenceType: 'pr_review',
      referenceId: String(prNumber),
      metadata: JSON.stringify({ repositoryFullName, prNumber }),
    })
    .returning({ id: creditTransactions.id });

  await serverDB
    .update(organizations)
    .set({ creditBalance: String(newBalance) })
    .where(eq(organizations.id, org.id));

  // Insert one ai_usage_logs row per model
  for (const [model, tokens] of Object.entries(aggregated)) {
    const costUsd = calculateCostUsd(model, tokens.inputTokens, tokens.outputTokens);
    const creditsDeducted = costUsd * CREDITS_PER_DOLLAR;
    await serverDB.insert(aiUsageLogs).values({
      organizationId: org.id,
      repositoryFullName,
      prNumber,
      modelName: model,
      inputTokens: tokens.inputTokens,
      outputTokens: tokens.outputTokens,
      totalTokens: tokens.inputTokens + tokens.outputTokens,
      costUsd: String(costUsd),
      creditsDeducted: String(creditsDeducted),
      creditTransactionId: creditTx.id,
    });
  }

  return NextResponse.json({
    success: true,
    creditsDeducted: totalCreditsToDeduct,
    newBalance,
  });
}
