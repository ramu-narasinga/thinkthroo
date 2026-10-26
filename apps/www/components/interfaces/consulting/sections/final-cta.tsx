import { LeadForm } from "../lead-form";
import type { LandingPageContent } from "@/lib/data/consulting/types";

export function FinalCta({
  finalCta,
  pageSlug,
}: {
  finalCta: LandingPageContent["finalCta"];
  pageSlug: string;
}) {
  return (
    <section className="mx-auto max-w-lg px-6 py-16">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">{finalCta.heading}</h2>
        <p className="mt-2 text-muted-foreground">{finalCta.subhead}</p>
      </div>
      <div className="mt-8">
        <LeadForm pageSlug={pageSlug} />
      </div>
    </section>
  );
}
