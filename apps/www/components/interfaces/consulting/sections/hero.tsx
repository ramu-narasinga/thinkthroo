"use client";

import { Button } from "@thinkthroo/ui/components/button";
import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/interfaces/page/header";
import { BookCallButton } from "../book-call-button";
import type { LandingPageContent } from "@/lib/data/consulting/types";

export function Hero({ content }: { content: LandingPageContent }) {
  return (
    <PageHeader>
      <PageHeaderHeading className="text-foreground">
        {content.hero.h1}
      </PageHeaderHeading>
      <PageHeaderDescription>{content.hero.subhead}</PageHeaderDescription>
      <PageActions>
        <BookCallButton label={content.hero.primaryCtaLabel} size="sm" />
        <Button size="sm" variant="outline" asChild>
          <a href="#lead-form">{content.hero.secondaryCtaLabel}</a>
        </Button>
      </PageActions>
      <p className="text-sm text-muted-foreground">
        Built in India · US-hours overlap · Fixed-price pilots
      </p>
    </PageHeader>
  );
}
