import { CaseStudyCard } from "../case-study-card";
import { SectionHeading } from "../section-heading";
import { getCaseStudy } from "@/lib/data/consulting/case-studies";

export function Proof({ caseStudySlugs }: { caseStudySlugs: string[] }) {
  const caseStudies = caseStudySlugs
    .map(getCaseStudy)
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  if (caseStudies.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading badge="Proof" title="Recent work" />
      <div className="grid gap-4 sm:grid-cols-2">
        {caseStudies.map((caseStudy) => (
          <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
        ))}
      </div>
    </section>
  );
}
