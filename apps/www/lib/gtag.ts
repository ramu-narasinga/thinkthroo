export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

type ConversionEvent = "form_submit" | "booked_call";

const LABELS: Record<ConversionEvent, string | undefined> = {
  form_submit: process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_FORM_SUBMIT,
  booked_call: process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_BOOKED_CALL,
};

function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  w.gtag?.(...args);
}

/** Enhanced Conversions: hands the lead's email to gtag.js, which hashes it client-side before sending. */
export function setEnhancedConversionEmail(email: string) {
  gtag("set", "user_data", { email });
}

export function reportConversion(
  event: ConversionEvent,
  params?: Record<string, unknown>
) {
  const label = LABELS[event];
  if (!GOOGLE_ADS_ID || !label) return;
  gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${label}`,
    ...params,
  });
}
