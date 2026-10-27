import { Button } from "@thinkthroo/ui/components/button";
import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/interfaces/page/header";
import type { ConsultingContent } from "@/lib/data/consulting/types";

export function Hero({ content }: { content: ConsultingContent }) {
  return (
    <PageHeader>
      <PageHeaderHeading className="text-foreground">
        {content.hero.h1}
      </PageHeaderHeading>
      <PageHeaderDescription>{content.hero.subhead}</PageHeaderDescription>
      <PageActions>
        <Button size="sm" asChild>
          <a href="#book">{content.hero.primaryCtaLabel}</a>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <a href="#offer">{content.hero.secondaryCtaLabel}</a>
        </Button>
      </PageActions>
      <p className="text-sm text-muted-foreground">
        Built in India · US-hours overlap · Fixed-price pilots
      </p>
    </PageHeader>
  );
}
