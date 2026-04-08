'use client';

import { useEffect, useRef, useState } from 'react';
import { initializePaddle, type Paddle, type CheckoutEventsData, type PaddleEventData } from '@paddle/paddle-js';

export type { CheckoutEventsData };

// Module-level singletons — Paddle must only be initialized once per page load.
let paddleInstance: Paddle | null = null;
let initPromise: Promise<void> | null = null;

// Sets of per-instance refs — supports multiple usePaddle consumers on the same page
// (e.g. BillingPage + BuyCreditsModal) without them trampling each other's callbacks.
type SuccessRef = React.MutableRefObject<((data: CheckoutEventsData) => void) | undefined>;
type ClosedRef = React.MutableRefObject<(() => void) | undefined>;
const successRefs = new Set<SuccessRef>();
const closedRefs = new Set<ClosedRef>();

export function usePaddle(
  onPaymentSuccess?: (data: CheckoutEventsData) => void,
  onCheckoutClosed?: () => void,
) {
  const [paddle, setPaddle] = useState<Paddle | null>(paddleInstance);

  // Per-instance refs — always current, never shared between consumers.
  const callbackRef = useRef(onPaymentSuccess);
  const closedRef = useRef(onCheckoutClosed);
  callbackRef.current = onPaymentSuccess;
  closedRef.current = onCheckoutClosed;

  useEffect(() => {
    // Register this instance's refs so the eventCallback dispatches to all mounted consumers.
    successRefs.add(callbackRef);
    closedRefs.add(closedRef);

    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) return;

    // Already initialized — expose the instance directly, no second init needed.
    if (paddleInstance) {
      setPaddle(paddleInstance);
      return () => {
        successRefs.delete(callbackRef);
        closedRefs.delete(closedRef);
      };
    }

    // First caller kicks off initialization; subsequent callers share the same promise.
    if (!initPromise) {
      initPromise = initializePaddle({
        token,
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
        eventCallback: (event: PaddleEventData) => {
          if (event.name === 'checkout.completed') {
            successRefs.forEach((ref) => ref.current?.(event.data as CheckoutEventsData));
          }
          if (event.name === 'checkout.closed') {
            closedRefs.forEach((ref) => ref.current?.());
          }
        },
      }).then((instance: Paddle | undefined) => {
        if (instance) paddleInstance = instance;
      });
    }

    initPromise!.then(() => {
      if (paddleInstance) setPaddle(paddleInstance);
    });

    return () => {
      successRefs.delete(callbackRef);
      closedRefs.delete(closedRef);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return paddle;
}
