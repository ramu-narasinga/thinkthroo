import { NextRequest, NextResponse } from 'next/server';
import { Paddle, EventName } from '@paddle/paddle-node-sdk';
import { eq, sql } from 'drizzle-orm';
import { getServerDB } from '@/database/core/db-adaptor';
import { organizations, subscriptions, customers, creditTransactions, creditTopups } from '@/database/schemas';

const paddle = new Paddle(process.env.PADDLE_API_KEY!);

const SUBSCRIPTION_CREDITS = 500;
const CREDITS_PER_DOLLAR = 10;

export async function POST(req: NextRequest) {
  const signature = req.headers.get('paddle-signature');
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 401 });
  }

  const rawBody = await req.text();

  const isValid = await paddle.webhooks.isSignatureValid(rawBody, webhookSecret, signature);
  if (!isValid) {
    console.error('[Paddle webhook] Invalid signature — rejecting request');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);
  console.log(`[Paddle webhook] Received event: ${event.eventType}`);
  const db = await getServerDB();

  switch (event.eventType) {
    case EventName.SubscriptionActivated: {
      const sub = event.data;
      console.log(`[SubscriptionActivated] subscriptionId=${sub.id} customerId=${sub.customerId} status=${sub.status}`);
      const firstItem = sub.items?.[0];
      const priceId = firstItem?.price?.id ?? null;
      const productId = firstItem?.price?.productId ?? null;
      const billingInterval = sub.billingCycle?.interval ?? null;

      // Upsert Paddle customer record
      await db
        .insert(customers)
        .values({ customerId: sub.customerId, email: '', userId: null })
        .onConflictDoNothing();
      console.log(`[SubscriptionActivated] Upserted customer record for customerId=${sub.customerId}`);

      // Prefer customData.organizationId (set by the client at checkout open) over
      // paddleCustomerId lookup — avoids a race condition where the webhook fires before
      // the client-side setPaddleCustomerId call has been persisted.
      const customDataOrgId = (sub.customData as Record<string, string> | null)?.organizationId ?? null;
      console.log(`[SubscriptionActivated] customData.organizationId=${customDataOrgId ?? 'none'}`);

      const org = customDataOrgId
        ? await db.query.organizations.findFirst({ where: eq(organizations.id, customDataOrgId) })
        : await db.query.organizations.findFirst({ where: eq(organizations.paddleCustomerId, sub.customerId) });

      if (!org) {
        console.warn(`[SubscriptionActivated] No org found (customDataOrgId=${customDataOrgId}, customerId=${sub.customerId}) — skipping`);
        break;
      }
      console.log(`[SubscriptionActivated] Found org id=${org.id} login=${org.login}`);

      // Always stamp paddleCustomerId onto the org so future webhook lookups work
      if (org.paddleCustomerId !== sub.customerId) {
        await db
          .update(organizations)
          .set({ paddleCustomerId: sub.customerId })
          .where(eq(organizations.id, org.id));
        console.log(`[SubscriptionActivated] Linked paddleCustomerId=${sub.customerId} to org id=${org.id}`);
      }

      // Upsert subscription record
      await db
        .insert(subscriptions)
        .values({
          subscriptionId: sub.id,
          subscriptionStatus: sub.status,
          priceId,
          productId,
          customerId: sub.customerId,
          organizationId: org.id,
          billingInterval,
          planDuration: billingInterval,
          expiresAt: sub.currentBillingPeriod?.endsAt ?? null,
        })
        .onConflictDoUpdate({
          target: subscriptions.subscriptionId,
          set: {
            subscriptionStatus: sub.status,
            priceId,
            productId,
            billingInterval,
            planDuration: billingInterval,
            expiresAt: sub.currentBillingPeriod?.endsAt ?? null,
            updatedAt: new Date().toISOString(),
          },
        });

      // Credit 500 credits and upgrade plan (only if not already pro to avoid double-crediting)
      const newBalance = Number(org.creditBalance) + (org.currentPlanName !== 'pro' ? SUBSCRIPTION_CREDITS : 0);
      const creditsGranted = org.currentPlanName !== 'pro' ? SUBSCRIPTION_CREDITS : 0;
      await db
        .update(organizations)
        .set({
          currentPlanName: 'pro',
          creditBalance: String(newBalance),
          planExpiresAt: sub.currentBillingPeriod?.endsAt ?? null,
        })
        .where(eq(organizations.id, org.id));
      console.log(`[SubscriptionActivated] Upgraded org id=${org.id} to pro, planExpiresAt=${sub.currentBillingPeriod?.endsAt ?? 'none'}, credited ${creditsGranted} credits (balance: ${org.creditBalance} → ${newBalance})`);

      if (creditsGranted > 0) {
        await db.insert(creditTransactions).values({
          organizationId: org.id,
          transactionType: 'subscription_grant',
          amount: String(creditsGranted),
          balanceAfter: String(newBalance),
          referenceType: 'paddle_subscription',
          referenceId: sub.id,
        });
        console.log(`[SubscriptionActivated] Credit transaction recorded (subscription_grant, +${creditsGranted})`);
      } else {
        console.log(`[SubscriptionActivated] Org already on pro — skipped credit grant to avoid double-credit`);
      }

      break;
    }

    case EventName.SubscriptionUpdated: {
      const sub = event.data;
      console.log(`[SubscriptionUpdated] subscriptionId=${sub.id} customerId=${sub.customerId} status=${sub.status}`);
      const firstItem = sub.items?.[0];
      const priceId = firstItem?.price?.id ?? null;
      const billingInterval = sub.billingCycle?.interval ?? null;

      await db
        .update(subscriptions)
        .set({
          subscriptionStatus: sub.status,
          priceId,
          billingInterval,
          planDuration: billingInterval,
          expiresAt: sub.currentBillingPeriod?.endsAt ?? null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(subscriptions.subscriptionId, sub.id));
      console.log(`[SubscriptionUpdated] Synced subscription record for subscriptionId=${sub.id}`);

      break;
    }

    case EventName.SubscriptionCanceled:
    case EventName.SubscriptionPaused: {
      const sub = event.data;
      console.log(`[${event.eventType}] subscriptionId=${sub.id} customerId=${sub.customerId} status=${sub.status}`);

      await db
        .update(subscriptions)
        .set({ subscriptionStatus: sub.status, updatedAt: new Date().toISOString() })
        .where(eq(subscriptions.subscriptionId, sub.id));
      console.log(`[${event.eventType}] Updated subscription status to ${sub.status}`);

      const org = await db.query.organizations.findFirst({
        where: eq(organizations.paddleCustomerId, sub.customerId),
      });

      if (!org) {
        console.warn(`[${event.eventType}] No org found for customerId=${sub.customerId} — skipping plan downgrade`);
        break;
      }

      await db
        .update(organizations)
        .set({ currentPlanName: 'free', planExpiresAt: null })
        .where(eq(organizations.id, org.id));
      console.log(`[${event.eventType}] Downgraded org id=${org.id} to free plan`);

      break;
    }

    case EventName.TransactionCompleted: {
      const tx = event.data;
      console.log(`[TransactionCompleted] transactionId=${tx.id} customerId=${tx.customerId} subscriptionId=${tx.subscriptionId ?? 'none'}`);

      // Only handle one-time top-up transactions (not subscription billing)
      if (tx.subscriptionId) {
        console.log(`[TransactionCompleted] Skipping — linked to subscription ${tx.subscriptionId}`);
        break;
      }

      const creditsPriceId = process.env.PADDLE_CREDITS_TOPUP_PRICE_ID;
      const topupItem = tx.items?.find((item) => item.price?.id === creditsPriceId);
      if (!topupItem) {
        console.warn(`[TransactionCompleted] No top-up price item found (expected priceId=${creditsPriceId}) — skipping`);
        break;
      }

      const quantity = topupItem.quantity ?? 0;
      const creditsAdded = quantity * CREDITS_PER_DOLLAR;
      const amountUsd = quantity; // $1 per unit = quantity dollars
      console.log(`[TransactionCompleted] Top-up item found: quantity=${quantity} → creditsAdded=${creditsAdded} ($${amountUsd})`);

      if (!tx.customerId) break;

      const org = await db.query.organizations.findFirst({
        where: eq(organizations.paddleCustomerId, tx.customerId),
      });

      if (!org) {
        console.warn(`[TransactionCompleted] No org found for customerId=${tx.customerId} — skipping`);
        break;
      }
      console.log(`[TransactionCompleted] Found org id=${org.id} currentBalance=${org.creditBalance}`);

      // Idempotency: skip if already processed
      const existing = await db.query.creditTopups.findFirst({
        where: eq(creditTopups.paddleTransactionId, tx.id),
      });
      if (existing) {
        console.warn(`[TransactionCompleted] Already processed transactionId=${tx.id} — skipping (idempotency guard)`);
        break;
      }

      const newBalance = Number(org.creditBalance) + creditsAdded;

      const [creditTx] = await db
        .insert(creditTransactions)
        .values({
          organizationId: org.id,
          transactionType: 'topup_purchase',
          amount: String(creditsAdded),
          balanceAfter: String(newBalance),
          referenceType: 'paddle_topup',
          referenceId: tx.id,
        })
        .returning();

      await db.insert(creditTopups).values({
        organizationId: org.id,
        paddleTransactionId: tx.id,
        creditsAdded: String(creditsAdded),
        amountUsd: String(amountUsd),
        status: 'completed',
        creditTransactionId: creditTx.id,
      });

      await db
        .update(organizations)
        .set({ creditBalance: String(newBalance) })
        .where(eq(organizations.id, org.id));
      console.log(`[TransactionCompleted] Credited ${creditsAdded} credits to org id=${org.id} (balance: ${org.creditBalance} → ${newBalance})`);

      break;
    }

    default:
      console.log(`[Paddle webhook] Unhandled event type: ${event.eventType}`);
      break;
  }

  return NextResponse.json({ received: true });
}
