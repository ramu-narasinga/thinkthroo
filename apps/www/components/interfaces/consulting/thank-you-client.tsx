"use client";

import { useEffect, useState } from "react";
import { setEnhancedConversionEmail, reportConversion } from "@/lib/gtag";
import { useUmami } from "@/hooks/use-umami";

const PENDING_LEAD_KEY = "tt_pending_lead";
const firedKey = (submissionId: string) => `tt_lead_fired_${submissionId}`;

export function ThankYouClient() {
  const { track } = useUmami();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_LEAD_KEY);
      if (raw) {
        const { submissionId, email } = JSON.parse(raw) as {
          submissionId: string;
          email?: string;
        };

        if (!sessionStorage.getItem(firedKey(submissionId))) {
          if (email) setEnhancedConversionEmail(email);
          reportConversion("form_submit");
          track("consulting_form_submit_conversion");
          sessionStorage.setItem(firedKey(submissionId), "1");
        }

        sessionStorage.removeItem(PENDING_LEAD_KEY);
      }
    } catch {
      // sessionStorage unavailable - skip the conversion, page still renders.
    } finally {
      setReady(true);
    }
  }, [track]);

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Thanks — got it.</h1>
      <p className="mt-4 text-muted-foreground">
        I'll review what you sent and reply by email, usually within a
        business day. If it's easier to just talk it through, you can still
        book a free 20-minute call.
      </p>
    </div>
  );
}
