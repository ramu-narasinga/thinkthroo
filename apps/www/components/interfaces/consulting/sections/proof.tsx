import { CaseStudyCard } from "../case-study-card";
import { getCaseStudy } from "@/lib/data/consulting/case-studies";

export function Proof({ caseStudySlugs }: { caseStudySlugs: string[] }) {
  const caseStudies = caseStudySlugs
    .map(getCaseStudy)
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  if (caseStudies.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h2 className="text-center text-2xl font-semibold">Recent work</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {caseStudies.map((caseStudy) => (
          <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
        ))}
      </div>
    </section>
  );
}
