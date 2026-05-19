import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';
import { eq, sql } from 'drizzle-orm';
import { getServerDB } from '@/database/core/db-adaptor';
import { organizations, subscriptions, customers, creditTransactions, creditTopups } from '@/database/schemas';

const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  environment: (process.env.DODO_PAYMENTS_ENVIRONMENT ?? 'test_mode') as 'test_mode' | 'live_mode',
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
});

const SUBSCRIPTION_CREDITS = 500;
const CREDITS_PER_DOLLAR = 10;

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  let event: ReturnType<typeof client.webhooks.unwrap>;
  try {
    event = client.webhooks.unwrap(rawBody, {
      headers: {
        'webhook-id': req.headers.get('webhook-id') ?? '',
        'webhook-signature': req.headers.get('webhook-signature') ?? '',
        'webhook-timestamp': req.headers.get('webhook-timestamp') ?? '',
      },
    });
  } catch {
    console.error('[Dodo webhook] Invalid signature — rejecting request');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  console.log(`[Dodo webhook] Received event: ${(event as any).type}`);
  const db = await getServerDB();
  const eventType = (event as any).type as string;
  const data = (event as any).data as Record<string, any>;

  switch (eventType) {
    case 'subscription.active': {
      const sub = data;
      console.log(`[subscription.active] subscriptionId=${sub.subscription_id} customerId=${sub.customer?.customer_id} status=${sub.status}`);

      const customerId: string = sub.customer?.customer_id ?? '';
      const productId: string = sub.product_id ?? null;
      const billingInterval: string = sub.recurring_pre_tax_amount != null
        ? (sub.payment_frequency_interval ?? null)
        : null;

      // Upsert Dodo customer record
      await db
        .insert(customers)
        .values({ customerId, email: sub.customer?.email ?? '', userId: null })
        .onConflictDoNothing();

      const customDataOrgId: string | null = sub.metadata?.organizationId ?? null;
      console.log(`[subscription.active] metadata.organizationId=${customDataOrgId ?? 'none'}`);

      const org = customDataOrgId
        ? await db.query.organizations.findFirst({ where: eq(organizations.id, customDataOrgId) })
        : await db.query.organizations.findFirst({ where: eq(organizations.dodoCustomerId, customerId) });

      if (!org) {
        console.warn(`[subscription.active] No org found (customDataOrgId=${customDataOrgId}, customerId=${customerId}) — skipping`);
        break;
      }

      if (org.dodoCustomerId !== customerId) {
        await db
          .update(organizations)
          .set({ dodoCustomerId: customerId })
          .where(eq(organizations.id, org.id));
      }

      await db
        .insert(subscriptions)
        .values({
          subscriptionId: sub.subscription_id,
          subscriptionStatus: sub.status,
          priceId: null,
          productId,
          customerId,
          organizationId: org.id,
          billingInterval,
          planDuration: billingInterval,
          expiresAt: sub.next_billing_date ?? null,
        })
        .onConflictDoUpdate({
          target: subscriptions.subscriptionId,
          set: {
            subscriptionStatus: sub.status,
            productId,
            billingInterval,
            planDuration: billingInterval,
            expiresAt: sub.next_billing_date ?? null,
            updatedAt: new Date().toISOString(),
          },
        });

      const creditsGranted = org.currentPlanName !== 'pro' ? SUBSCRIPTION_CREDITS : 0;
      const newBalance = Number(org.creditBalance) + creditsGranted;

      await db
        .update(organizations)
        .set({
          currentPlanName: 'pro',
          creditBalance: String(newBalance),
          planExpiresAt: sub.next_billing_date ?? null,
        })
        .where(eq(organizations.id, org.id));
      console.log(`[subscription.active] Upgraded org id=${org.id} to pro, credited ${creditsGranted} credits`);

      if (creditsGranted > 0) {
        await db.insert(creditTransactions).values({
          organizationId: org.id,
          transactionType: 'subscription_grant',
          amount: String(creditsGranted),
          balanceAfter: String(newBalance),
          referenceType: 'dodo_subscription',
          referenceId: sub.subscription_id,
        });
      }

      break;
    }

    case 'subscription.updated': {
      const sub = data;
      console.log(`[subscription.updated] subscriptionId=${sub.subscription_id} status=${sub.status}`);

      const billingInterval: string = sub.payment_frequency_interval ?? null;

      await db
        .update(subscriptions)
        .set({
          subscriptionStatus: sub.status,
          billingInterval,
          planDuration: billingInterval,
          expiresAt: sub.next_billing_date ?? null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(subscriptions.subscriptionId, sub.subscription_id));

      break;
    }

    case 'subscription.cancelled': {
      const sub = data;
      console.log(`[subscription.cancelled] subscriptionId=${sub.subscription_id} status=${sub.status}`);

      await db
        .update(subscriptions)
        .set({ subscriptionStatus: sub.status, updatedAt: new Date().toISOString() })
        .where(eq(subscriptions.subscriptionId, sub.subscription_id));

      const customerId: string = sub.customer?.customer_id ?? '';
      const org = await db.query.organizations.findFirst({
        where: eq(organizations.dodoCustomerId, customerId),
      });

      if (!org) {
        console.warn(`[subscription.cancelled] No org found for customerId=${customerId}`);
        break;
      }

      await db
        .update(organizations)
        .set({ currentPlanName: 'free', planExpiresAt: null })
        .where(eq(organizations.id, org.id));
      console.log(`[subscription.cancelled] Downgraded org id=${org.id} to free`);

      break;
    }

    case 'payment.succeeded': {
      const payment = data;
      console.log(`[payment.succeeded] paymentId=${payment.payment_id} metadata.type=${payment.metadata?.type}`);

      // Only handle one-time credit top-ups
      if (payment.metadata?.type !== 'topup') {
        console.log(`[payment.succeeded] Skipping — not a topup (type=${payment.metadata?.type})`);
        break;
      }

      const paymentId: string = payment.payment_id;
      const customerId: string = payment.customer?.customer_id ?? '';
      const quantity: number = payment.metadata?.quantity ? Number(payment.metadata.quantity) : 0;
      const creditsAdded = quantity * CREDITS_PER_DOLLAR;
      const amountUsd = quantity;

      if (!customerId || creditsAdded <= 0) break;

      const org = await db.query.organizations.findFirst({
        where: eq(organizations.dodoCustomerId, customerId),
      });

      if (!org) {
        console.warn(`[payment.succeeded] No org found for customerId=${customerId}`);
        break;
      }

      // Idempotency: skip if already processed
      const existing = await db.query.creditTopups.findFirst({
        where: eq(creditTopups.dodoPaymentId, paymentId),
      });
      if (existing) {
        console.warn(`[payment.succeeded] Already processed paymentId=${paymentId} — skipping`);
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
          referenceType: 'dodo_topup',
          referenceId: paymentId,
        })
        .returning();

      await db.insert(creditTopups).values({
        organizationId: org.id,
        dodoPaymentId: paymentId,
        creditsAdded: String(creditsAdded),
        amountUsd: String(amountUsd),
        status: 'completed',
        creditTransactionId: creditTx.id,
      });

      await db
        .update(organizations)
        .set({ creditBalance: String(newBalance) })
        .where(eq(organizations.id, org.id));
      console.log(`[payment.succeeded] Credited ${creditsAdded} credits to org id=${org.id}`);

      break;
    }

    default:
      console.log(`[Dodo webhook] Unhandled event type: ${eventType}`);
      break;
  }

  return NextResponse.json({ received: true });
}
