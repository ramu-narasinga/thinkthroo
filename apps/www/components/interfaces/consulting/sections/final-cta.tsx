import { LeadForm } from "../lead-form";
import { SectionHeading } from "../section-heading";
import type { LandingPageContent } from "@/lib/data/consulting/types";

export function FinalCta({
  finalCta,
  pageSlug,
}: {
  finalCta: LandingPageContent["finalCta"];
  pageSlug: string;
}) {
  return (
    <section className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading badge="Get started" title={finalCta.heading} description={finalCta.subhead} />
      <div className="rounded-2xl border border-border/50 bg-card/30 p-8">
        <LeadForm pageSlug={pageSlug} />
      </div>
    </section>
  );
}
