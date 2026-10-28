/** Marker prefix used across consulting content for unresolved placeholders. */
export const TODO_PREFIX = "{{TODO";

export const consultingConfig = {
  /**
   * Cal.com / Calendly booking link. Defaults to the same 30-minute event the /contact page
   * embeds, so the "30-minute call" copy matches what visitors actually book.
   */
  bookingUrl:
    process.env.NEXT_PUBLIC_CONSULTING_BOOKING_URL ||
    "https://cal.com/ramu-narasinga-rqy5ut/30min",
};
