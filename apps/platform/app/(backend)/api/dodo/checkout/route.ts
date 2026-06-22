import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';

const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  environment: (process.env.DODO_PAYMENTS_ENVIRONMENT ?? 'test_mode') as 'test_mode' | 'live_mode',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, quantity, organizationId, userEmail, type, amount } = body as {
      productId: string;
      quantity?: number;
      organizationId: string;
      userEmail: string;
      type: 'subscription' | 'topup';
      amount?: number;
    };

    if (!productId || !organizationId || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/account/billing?success=true&type=${type}${amount ? `&amount=${amount}` : ''}`;

    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: quantity ?? 1 }],
      customer: { email: userEmail, name: userEmail },
      metadata: {
        organizationId,
        type,
        ...(type === 'topup' ? { quantity: String(quantity ?? 1) } : {}),
      },
      return_url: returnUrl,
    } as any);

    return NextResponse.json({ checkoutUrl: (session as any).checkout_url });
  } catch (error) {
    console.error('[Dodo checkout] Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
