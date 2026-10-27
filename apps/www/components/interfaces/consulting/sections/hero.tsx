import {
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
      <p className="text-sm text-muted-foreground">{content.hero.trustLine}</p>
    </PageHeader>
  );
}
