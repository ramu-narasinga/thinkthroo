'use client';

import { useEffect, useRef, useState } from 'react';
import { initializePaddle, type Paddle, type CheckoutEventsData } from '@paddle/paddle-js';

export type { CheckoutEventsData };

// Module-level singletons — Paddle must only be initialized once per page load.
let paddleInstance: Paddle | null = null;
let initPromise: Promise<void> | null = null;

export function usePaddle(
  onPaymentSuccess?: (data: CheckoutEventsData) => void,
  onCheckoutClosed?: () => void,
) {
  const [paddle, setPaddle] = useState<Paddle | null>(paddleInstance);

  // Always keep the refs current so the eventCallback never closes over stale functions.
  const callbackRef = useRef(onPaymentSuccess);
  callbackRef.current = onPaymentSuccess;

  const closedRef = useRef(onCheckoutClosed);
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
        eventCallback: (event) => {
          if (event.name === 'checkout.completed') {
            callbackRef.current?.(event.data as CheckoutEventsData);
          }
          if (event.name === 'checkout.closed') {
            closedRef.current?.();
          }
        },
      }).then((instance) => {
        if (instance) paddleInstance = instance;
      });
    }

    initPromise.then(() => {
      if (paddleInstance) setPaddle(paddleInstance);
    });
  }, []);

  return paddle;
}
