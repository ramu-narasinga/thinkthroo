import { Button, type buttonVariants } from "@thinkthroo/ui/components/button";
import type { VariantProps } from "class-variance-authority";
import { consultingConfig } from "@/lib/data/consulting/config";
import { CAL_NAMESPACE } from "./cal-init";

/** Path portion of a cal.com URL, e.g. "team-thinkthroo-dxiovj/consultation". Undefined if bookingUrl isn't a cal.com link. */
function getCalLink(bookingUrl: string): string | undefined {
  const match = bookingUrl.match(/cal\.com\/(.+)$/);
  return match?.[1];
}

export function BookCallButton({
  label,
  className,
  size,
}: {
  label: string;
  className?: string;
  size?: VariantProps<typeof buttonVariants>["size"];
}) {
  const calLink = getCalLink(consultingConfig.bookingUrl);

  if (!calLink) {
    // Non-cal.com booking URL (e.g. Calendly) - fall back to a plain link, no confirmation event available.
    return (
      <Button asChild size={size} className={className}>
        <a href={consultingConfig.bookingUrl} target="_blank" rel="noreferrer">
          {label}
        </a>
      </Button>
    );
  }

  return (
    <Button
      size={size}
      className={className}
      data-cal-namespace={CAL_NAMESPACE}
      data-cal-link={calLink}
      data-cal-config='{"layout":"month_view"}'
    >
      {label}
    </Button>
  );
}
