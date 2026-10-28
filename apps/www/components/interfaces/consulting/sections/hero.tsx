import { GridBackground } from "../grid-background";
import { BookingSection } from "../booking-section";
import type { ConsultingContent } from "@/lib/data/consulting/types";

export function Hero({ content }: { content: ConsultingContent }) {
  const { callBenefits, ideas } = content.hero;

  return (
    <section className="relative w-full bg-gradient-to-b from-background to-secondary/5">
      <GridBackground />

      <div className="container relative grid gap-10 py-12 lg:grid-cols-2 lg:items-start lg:gap-16 lg:py-20">
        <div className="text-center lg:text-left">
          <h1 className="text-primary mx-auto max-w-2xl text-4xl leading-tighter font-semibold tracking-tight text-balance lg:mx-0 lg:leading-[1.1] xl:text-5xl xl:tracking-tighter">
            {content.hero.h1}
          </h1>
          <p className="text-foreground mx-auto mt-4 max-w-xl text-base text-balance sm:text-lg lg:mx-0">
            {content.hero.subhead}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">{content.hero.trustLine}</p>

          {/* Desktop only: on mobile the form sits right under the headline, so extra copy would just push it down the page. */}
          <div className="mt-10 hidden space-y-8 text-left lg:block">
            <div className="max-w-xl rounded-2xl border border-border/50 bg-card p-6 shadow-xl shadow-black/5 dark:shadow-black/30">
              <p className="text-sm font-semibold text-foreground">{callBenefits.heading}</p>
              <ul className="mt-4 space-y-3">
                {callBenefits.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-foreground">
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
                    >
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="max-w-xl">
              <p className="text-sm font-semibold text-foreground">{ideas.heading}</p>
              <ul className="mt-3 space-y-2">
                {ideas.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                    <span aria-hidden className="text-primary">
                      →
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
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
