const STORAGE_KEY = "tt_attribution";

const FIELDS = [
  "gclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type Attribution = Partial<Record<(typeof FIELDS)[number], string>>;

/** Captures gclid/UTM params from the URL on first touch only; later page views in the same session don't overwrite it. */
export function captureAttributionFromUrl(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const data: Attribution = {};
    let found = false;
    for (const field of FIELDS) {
      const value = params.get(field);
      if (value) {
        data[field] = value;
        found = true;
      }
    }
    if (found) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage unavailable (private mode, etc.) - attribution is best-effort.
  }
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
