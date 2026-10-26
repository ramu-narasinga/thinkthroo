import { siteConfig } from "@/lib/config";

/** Marker prefix used across consulting content for unresolved placeholders. */
export const TODO_PREFIX = "{{TODO";

export const consultingConfig = {
  /** Cal.com / Calendly booking link. Falls back to the existing site-wide consultation link. */
  bookingUrl:
    process.env.NEXT_PUBLIC_CONSULTING_BOOKING_URL ||
    siteConfig.links.consultation,

  engineerName: `{{TODO: your name}}`,
  engineerPhoto: `{{TODO: /path/to/photo.jpg}}`,
  engineerBio: `{{TODO: 2-3 sentence bio - background, years building production software, what you specialize in}}`,

  pilotPriceFrom: `{{TODO: pilot starting price, e.g. "$1,500"}}`,
};
