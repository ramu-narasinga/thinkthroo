"use client";

import { useEffect } from "react";
import { getCalApi } from "@calcom/embed-react";
import { setEnhancedConversionEmail, reportConversion } from "@/lib/gtag";
import { useUmami } from "@/hooks/use-umami";

export const CAL_NAMESPACE = "consulting";

/** Fired on window once Cal confirms a booking, so every BookingSection can swap its card for the confirmation. */
export const CALL_BOOKED_EVENT = "consulting:call-booked";

/**
 * Initializes the Cal.com embed once per page and registers the booking-confirmation
 * listener. Mounted once in the (consulting) layout - BookingSection instances only render
 * the picker, so multiple instances on one page never double-register this listener (which
 * would double-fire the booked_call conversion). It announces the booking on window instead
 * of redirecting; each BookingSection swaps its card for the confirmation in place.
 */
export function CalInit() {
  const { track } = useUmami();

  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: CAL_NAMESPACE });
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
      cal("on", {
        action: "bookingSuccessful",
        callback: (e: any) => {
          const email = e?.detail?.data?.booking?.attendees?.[0]?.email;
          if (email) setEnhancedConversionEmail(email);
          reportConversion("booked_call");
          track("consulting_booked_call");
          window.dispatchEvent(new Event(CALL_BOOKED_EVENT));
        },
      });
    })();
  }, [track]);

  return null;
}
