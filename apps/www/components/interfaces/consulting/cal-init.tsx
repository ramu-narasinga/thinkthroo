"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCalApi } from "@calcom/embed-react";
import { setEnhancedConversionEmail, reportConversion } from "@/lib/gtag";
import { useUmami } from "@/hooks/use-umami";

export const CAL_NAMESPACE = "consulting";

/**
 * Initializes the Cal.com embed once per page and registers the booking-confirmation
 * listener. Mounted once in the (consulting) layout - BookCallButton instances just
 * render data-cal-link triggers, so multiple buttons on one page never double-register
 * this listener (which would double-fire the booked_call conversion).
 */
export function CalInit() {
  const router = useRouter();
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
          router.push("/booked");
        },
      });
    })();
  }, [router, track]);

  return null;
}
