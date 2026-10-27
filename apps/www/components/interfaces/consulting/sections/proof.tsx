import { TodoText } from "../todo-text";
import { SectionHeading } from "../section-heading";
import type { CaseStudyContent } from "@/lib/data/consulting/types";

export function Proof({ caseStudy }: { caseStudy: CaseStudyContent }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading badge="Proof" title={caseStudy.title} description={caseStudy.tagline} />
      <div className="rounded-2xl border border-border/50 bg-card/30 p-8 lg:p-10">
        <p className="text-muted-foreground leading-relaxed">{caseStudy.problem}</p>

        <h3 className="mt-6 text-sm font-semibold text-foreground">What's actually running</h3>
        <ul className="mt-3 space-y-2">
          {caseStudy.whatIBuilt.map((item) => (
            <li key={item} className="flex gap-3 text-sm text-muted-foreground">
              <span
                aria-hidden
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
              >
                ✓
              </span>
              <span>
                <TodoText>{item}</TodoText>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-2">
          {caseStudy.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-border/50 bg-card/50 px-3 py-1 text-xs text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">{caseStudy.result}</p>
        </div>
      </div>
    </section>
  );
}
