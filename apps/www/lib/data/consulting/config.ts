import { siteConfig } from "@/lib/config";

/** Marker prefix used across consulting content for unresolved placeholders. */
export const TODO_PREFIX = "{{TODO";

export const consultingConfig = {
  /** Cal.com / Calendly booking link. Falls back to the existing site-wide consultation link. */
  bookingUrl:
    process.env.NEXT_PUBLIC_CONSULTING_BOOKING_URL ||
    siteConfig.links.consultation,

  pilotPriceFrom: "$2,000",
};
