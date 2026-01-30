/**
 * Marketplace Webhook Test Script
 * 
 * Simulates GitHub Marketplace webhook events for local testing
 * Run this to test marketplace purchase flow without actual installations
 * 
 * Usage: npx tsx test/marketplace-webhook-test.ts
 */

import { config } from 'dotenv';
import * as crypto from 'crypto';

config();

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/github/webhooks';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  console.error('❌ WEBHOOK_SECRET is not set in .env file');
  process.exit(1);
}

// Mock marketplace purchase payloads - Free and Pro tiers
const mockPayloads = {
//   purchased_free: {
//     action: 'purchased',
//     marketplace_purchase: {
//       account: {
//         id: 123456789,
//         login: 'ramu-narasinga',
//         type: 'Organization',
//       },
//       plan: {
//         id: 1,
//         name: 'Free',
//         monthly_price_in_cents: 0,
//       },
//     },
//   },
  purchased_pro: {
    action: 'purchased',
    marketplace_purchase: {
      account: {
        id: 123456789,
        login: 'ramu-narasinga',
        type: 'Organization',
      },
      plan: {
        id: 2,
        name: 'Pro',
        monthly_price_in_cents: 2900, // $29/month
      },
    },
  },
//   upgraded_to_pro: {
//     action: 'changed',
//     marketplace_purchase: {
//       account: {
//         id: 123456789,
//         login: 'ramu-narasinga',
//         type: 'Organization',
//       },
//       plan: {
//         id: 2,
//         name: 'Pro',
//         monthly_price_in_cents: 2900,
//       },
//     },
//     previous_marketplace_purchase: {
//       plan: {
//         id: 1,
//         name: 'Free',
//         monthly_price_in_cents: 0,
//       },
//     },
//   },
//   downgraded_to_free: {
//     action: 'changed',
//     marketplace_purchase: {
//       account: {
//         id: 123456789,
//         login: 'ramu-narasinga',
//         type: 'Organization',
//       },
//       plan: {
//         id: 1,
//         name: 'Free',
//         monthly_price_in_cents: 0,
//       },
//     },
//     previous_marketplace_purchase: {
//       plan: {
//         id: 2,
//         name: 'Pro',
//         monthly_price_in_cents: 2900,
//       },
//     },
//   },
//   cancelled: {
//     action: 'cancelled',
//     marketplace_purchase: {
//       account: {
//         id: 123456789,
//         login: 'ramu-narasinga',
//         type: 'Organization',
//       },
//       plan: {
//         id: 2,
//         name: 'Pro',
//         monthly_price_in_cents: 2900,
//       },
//     },
//   },
};

async function sendWebhook(event: keyof typeof mockPayloads) {
  const payload = mockPayloads[event];
  const payloadString = JSON.stringify(payload);
  
  // Generate proper HMAC signature
  const signature = 'sha256=' + crypto
    .createHmac('sha256', WEBHOOK_SECRET!)
    .update(payloadString)
    .digest('hex');
  
  console.log(`\n🚀 Sending ${event} webhook event...`);
  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GitHub-Event': `marketplace_purchase`,
        'X-GitHub-Delivery': crypto.randomUUID(),
        'X-Hub-Signature-256': signature,
      },
      body: payloadString,
    });

    const responseText = await response.text();
    
    if (response.ok) {
      console.log(`✅ ${event} event processed successfully`);
      console.log('Response:', responseText);
    } else {
      console.error(`❌ ${event} event failed:`, response.status, responseText);
    }
  } catch (error) {
    console.error(`❌ Error sending ${event} webhook:`, error);
  }
}

async function runTests() {
  console.log('Starting Marketplace Webhook Tests');
  console.log(`Target URL: ${WEBHOOK_URL}\n`);
  console.log('⚠️  Make sure your GitHub App is running locally\n');

  // Test Free plan purchase
//   await sendWebhook('purchased_free');
//   await new Promise(resolve => setTimeout(resolve, 1000));

  // Test Pro plan purchase
  await sendWebhook('purchased_pro');
  await new Promise(resolve => setTimeout(resolve, 1000));

//   // Test upgrade from Free to Pro
//   await sendWebhook('upgraded_to_pro');
//   await new Promise(resolve => setTimeout(resolve, 1000));

//   // Test downgrade from Pro to Free
//   await sendWebhook('downgraded_to_free');
//   await new Promise(resolve => setTimeout(resolve, 1000));

//   // Test cancellation
//   await sendWebhook('cancelled');

  console.log('\n✨ All tests completed');
  console.log('\n📊 Pricing Tiers:');
  console.log('  • Free: 10 credits ($0/month)');
  console.log('  • Pro: 500 credits ($29/month)');
}

// Run tests
runTests().catch(console.error);
