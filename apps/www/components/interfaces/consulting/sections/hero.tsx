"use client";

import { Button } from "@thinkthroo/ui/components/button";
import { BookCallButton } from "../book-call-button";
import type { LandingPageContent } from "@/lib/data/consulting/types";

export function Hero({ content }: { content: LandingPageContent }) {
  return (
    <section className="mx-auto max-w-3xl px-6 pb-10 pt-16 text-center md:pt-24">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
        {content.hero.h1}
      </h1>
      <p className="mt-5 text-lg text-muted-foreground">
        {content.hero.subhead}
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <BookCallButton label={content.hero.primaryCtaLabel} size="lg" />
        <Button size="lg" variant="outline" asChild>
          <a href="#lead-form">{content.hero.secondaryCtaLabel}</a>
        </Button>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Built in India · US-hours overlap · Fixed-price pilots
      </p>
    </section>
  );
}
