'use client';

import { useEffect, useState } from 'react';
import { initializePaddle, type Paddle, type CheckoutEventsData, type PaddleEventData } from '@paddle/paddle-js';

export type { CheckoutEventsData };

// Module-level singletons — Paddle must only be initialized once per page load.
let paddleInstance: Paddle | null = null;
let initPromise: Promise<void> | null = null;

// Module-level refs so they survive component remounts and always reflect the
// latest callbacks — the Paddle eventCallback closes over these, not per-render values.
const callbackRef: { current: ((data: CheckoutEventsData) => void) | undefined } = { current: undefined };
const closedRef: { current: (() => void) | undefined } = { current: undefined };

export function usePaddle(
  onPaymentSuccess?: (data: CheckoutEventsData) => void,
  onCheckoutClosed?: () => void,
) {
  const [paddle, setPaddle] = useState<Paddle | null>(paddleInstance);

  // Update module-level refs on every render so eventCallback always has fresh handlers.
  callbackRef.current = onPaymentSuccess;
  closedRef.current = onCheckoutClosed;

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) return;

    // Already initialized — expose the instance directly, no second init needed.
    if (paddleInstance) {
      setPaddle(paddleInstance);
      return;
    }

    // First caller kicks off initialization; subsequent callers share the same promise.
    if (!initPromise) {
      initPromise = initializePaddle({
        token,
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
        eventCallback: (event: PaddleEventData) => {
          if (event.name === 'checkout.completed') {
            callbackRef.current?.(event.data as CheckoutEventsData);
          }
          if (event.name === 'checkout.closed') {
            closedRef.current?.();
          }
        },
      }).then((instance: Paddle | undefined) => {
        if (instance) paddleInstance = instance;
      });
    }

    initPromise!.then(() => {
      if (paddleInstance) setPaddle(paddleInstance);
    });
  }, []);

  return paddle;
}
