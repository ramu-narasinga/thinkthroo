import { SectionHeading } from "../section-heading";
import type { LandingPageContent } from "@/lib/data/consulting/types";

export function IndiaAngle({
  indiaAngle,
}: {
  indiaAngle: LandingPageContent["indiaAngle"];
}) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading badge="India" title={indiaAngle.heading} />
      <div className="space-y-4 rounded-2xl border border-border/50 bg-card/30 p-8 text-muted-foreground leading-relaxed lg:p-10">
        {indiaAngle.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
