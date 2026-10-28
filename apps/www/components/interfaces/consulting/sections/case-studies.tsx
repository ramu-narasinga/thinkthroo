import { GridBackground } from "../grid-background";
import { SectionHeading } from "../section-heading";
import type { CaseStudiesContent } from "@/lib/data/consulting/types";

export function CaseStudies({ content }: { content: CaseStudiesContent }) {
  return (
    <section className="relative w-full">
      <GridBackground />

      <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading badge="Proof" title={content.title} description={content.tagline} />

        <div className="grid gap-6 md:grid-cols-2">
          {content.items.map((study) => (
            <article
              key={study.title}
              className="flex h-full flex-col rounded-2xl border border-border/50 bg-card p-6 shadow-xl shadow-black/5 dark:shadow-black/30 lg:p-8"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                {study.label}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-foreground">{study.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{study.summary}</p>

              <ul className="mt-5 space-y-2">
                {study.howItWorks.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
                    >
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-2">
                {study.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-border/50 bg-card/50 px-3 py-1 text-xs text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-6">
                <p className="border-t border-border/50 pt-5 text-sm font-medium text-foreground">
                  {study.result}
                </p>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">{content.footnote}</p>
      </div>
    </section>
  );
}
