import { NextRequest, NextResponse } from 'next/server';
import { eq, and, sql } from 'drizzle-orm';
import { serverDB } from '@/database';
import { installations, organizations, creditTransactions, aiUsageLogs } from '@/database/schemas';
import { isValidInternalSecret } from '@/lib/server/internal-auth';
import { trackPlatformSecuritySignal } from '@/lib/server/security-alerts';

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
  if (!isValidInternalSecret(req.headers)) {
    await trackPlatformSecuritySignal({
      signal: 'internal_auth_failed_credits_deduct',
      threshold: 3,
      windowSeconds: 60,
      text: ':rotating_light: Repeated failed internal auth on /api/credits/deduct.',
      fields: {
        route: '/api/credits/deduct',
      },
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    installationId?: string;
    repositoryFullName?: string;
    prNumber?: number;
    usage?: UsageEntry[];
    idempotencyKey?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { installationId, repositoryFullName, prNumber, usage, idempotencyKey } = body;

  if (!installationId || !repositoryFullName || prNumber == null || !Array.isArray(usage) || !idempotencyKey) {
    return NextResponse.json(
      { error: 'installationId, repositoryFullName, prNumber, usage[], and idempotencyKey are required' },
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
  const totalCreditsToDeduct = Number((totalCostUsd * CREDITS_PER_DOLLAR).toFixed(2));

  if (totalCreditsToDeduct === 0) {
    return NextResponse.json({ success: true, creditsDeducted: 0, newBalance: Number(org.creditBalance) });
  }

  const deductionResult = await serverDB.transaction(async (tx) => {
    // Serialize all deductions for the same idempotency key and prevent duplicate charging.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${idempotencyKey}))`);

    const [existingTx] = await tx
      .select({
        id: creditTransactions.id,
        amount: creditTransactions.amount,
        balanceAfter: creditTransactions.balanceAfter,
      })
      .from(creditTransactions)
      .where(
        and(
          eq(creditTransactions.organizationId, org.id),
          eq(creditTransactions.idempotencyKey, idempotencyKey),
        ),
      )
      .limit(1);

    if (existingTx) {
      await trackPlatformSecuritySignal({
        signal: 'credits_deduct_idempotent_hit',
        threshold: 5,
        windowSeconds: 60,
        text: ':warning: Elevated idempotent credit deduction retries detected.',
        fields: {
          route: '/api/credits/deduct',
          organizationId: org.id,
        },
      });
      return {
        success: true as const,
        idempotent: true as const,
        creditsDeducted: Math.abs(Number(existingTx.amount)),
        newBalance: Number(existingTx.balanceAfter),
      };
    }

    const [updatedOrg] = await tx
      .update(organizations)
      .set({ creditBalance: sql`${organizations.creditBalance} - ${totalCreditsToDeduct}` })
      .where(
        and(
          eq(organizations.id, org.id),
          sql`${organizations.creditBalance} >= ${totalCreditsToDeduct}`,
        ),
      )
      .returning({ creditBalance: organizations.creditBalance });

    if (!updatedOrg) {
      const [latestOrg] = await tx
        .select({ creditBalance: organizations.creditBalance })
        .from(organizations)
        .where(eq(organizations.id, org.id))
        .limit(1);

      await trackPlatformSecuritySignal({
        signal: 'credits_deduct_insufficient_balance',
        threshold: 5,
        windowSeconds: 60,
        text: ':warning: Elevated insufficient-credit deduction attempts detected.',
        fields: {
          route: '/api/credits/deduct',
          organizationId: org.id,
        },
      });

      return {
        success: false as const,
        reason: 'insufficient_credits' as const,
        currentBalance: Number(latestOrg?.creditBalance ?? 0),
        creditsRequired: totalCreditsToDeduct,
      };
    }

    const newBalance = Number(updatedOrg.creditBalance);

    const [creditTx] = await tx
      .insert(creditTransactions)
      .values({
        organizationId: org.id,
        transactionType: 'ai_usage',
        amount: String(-totalCreditsToDeduct),
        balanceAfter: String(newBalance),
        referenceType: 'pr_review',
        referenceId: String(prNumber),
        idempotencyKey,
        metadata: JSON.stringify({ repositoryFullName, prNumber, idempotencyKey }),
      })
      .returning({ id: creditTransactions.id });

    const usageLogRows = Object.entries(aggregated).map(([model, tokens]) => {
      const costUsd = Number(calculateCostUsd(model, tokens.inputTokens, tokens.outputTokens).toFixed(4));
      const creditsDeducted = Number((costUsd * CREDITS_PER_DOLLAR).toFixed(2));
      return {
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
      };
    });

    if (usageLogRows.length > 0) {
      await tx.insert(aiUsageLogs).values(usageLogRows);
    }

    return {
      success: true as const,
      idempotent: false as const,
      creditsDeducted: totalCreditsToDeduct,
      newBalance,
    };
  });

  return NextResponse.json(deductionResult);
}
