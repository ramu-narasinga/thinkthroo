# Marketplace Webhook Testing Guide

## Problem
When testing a GitHub App in draft mode, you may encounter:
> "You've already purchased this on all of your GitHub accounts"

This is a GitHub limitation for draft marketplace apps.

## Solution: Test with Webhook Payloads

Instead of repeatedly installing the app, send marketplace webhook events directly to your local server.

## Setup

1. **Start your GitHub App locally:**
   ```bash
   cd apps/github-app
   pnpm run dev
   ```

2. **In another terminal, run the test script:**
   ```bash
   npx tsx test/marketplace-webhook-test.ts
   ```

## What the Script Does

The script simulates three marketplace events:
- `marketplace_purchase.purchased` - New plan purchase
- `marketplace_purchase.changed` - Plan upgrade/downgrade
- `marketplace_purchase.cancelled` - Plan cancellation

## Customizing Test Data

Edit `test/marketplace-webhook-test.ts` to change:
- Account ID and login
- Plan names and prices
- Organization type (User vs Organization)

Example:
```typescript
marketplace_purchase: {
  account: {
    id: 123456789,        // Your test org ID
    login: 'test-org',    // Your test org login
    type: 'Organization',
  },
  plan: {
    id: 1,
    name: 'Pro Plan',     // Your plan name
    monthly_price_in_cents: 2000,  // $20.00
  },
}
```

## Verifying Results

Check your logs and database to verify:
1. Purchase record was created
2. Organization plan was updated
3. Credits were added (for purchased events)

## Using with ngrok/Production

To test against a deployed webhook URL:
```bash
WEBHOOK_URL=https://your-app.com/api/github/webhooks npx tsx test/marketplace-webhook-test.ts
```

## Next Steps

Once your app is publicly listed, real marketplace webhooks will flow automatically without needing this test script.
