import { GridBackground } from "../grid-background";
import { BookingSection } from "../booking-section";
import type { ConsultingContent } from "@/lib/data/consulting/types";

export function Hero({ content }: { content: ConsultingContent }) {
  return (
    <section className="relative w-full bg-gradient-to-b from-background to-secondary/5">
      <GridBackground />

      <div className="container relative grid gap-10 py-12 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
        <div className="text-center lg:text-left">
          <h1 className="text-primary mx-auto max-w-2xl text-4xl leading-tighter font-semibold tracking-tight text-balance lg:mx-0 lg:leading-[1.1] xl:text-5xl xl:tracking-tighter">
            {content.hero.h1}
          </h1>
          <p className="text-foreground mx-auto mt-4 max-w-xl text-base text-balance sm:text-lg lg:mx-0">
            {content.hero.subhead}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">{content.hero.trustLine}</p>
        </div>

        <BookingSection
          instanceId="top"
          variant="compact"
          heading={content.booking.heading}
          subhead={content.booking.subhead}
        />
      </div>
    </section>
  );
}
