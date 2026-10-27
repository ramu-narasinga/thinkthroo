import { BookingSection } from "../booking-section";
import type { ConsultingContent } from "@/lib/data/consulting/types";

export function Hero({ content }: { content: ConsultingContent }) {
  return (
    <section className="relative w-full bg-gradient-to-b from-background to-secondary/5">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_0%,transparent_80%)]" />
      </div>

      <div className="relative container grid gap-10 py-12 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
        <div className="text-center lg:text-left">
          <h1 className="text-primary mx-auto max-w-2xl text-4xl leading-tighter font-semibold tracking-tight text-balance lg:mx-0 lg:leading-[1.1] xl:text-5xl xl:tracking-tighter">
            {content.hero.h1}
          </h1>
          <p className="text-foreground mx-auto mt-4 max-w-xl text-base text-balance sm:text-lg lg:mx-0">
            {content.hero.subhead}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">{content.hero.trustLine}</p>
        </div>

        <div>
          <BookingSection
            instanceId="top"
            variant="compact"
            heading={content.booking.heading}
            subhead={content.booking.subhead}
          />
        </div>
      </div>
    </section>
  );
}
