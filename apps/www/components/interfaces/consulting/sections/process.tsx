import { SectionHeading } from "../section-heading";
import type { ProcessStep } from "@/lib/data/consulting/types";

export function Process({ steps }: { steps: ProcessStep[] }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading badge="Process" title="How it works" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="rounded-lg border border-border/50 bg-card/50 p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-sm font-semibold text-primary">
              {i + 1}
            </div>
            <h3 className="mt-4 font-semibold text-foreground">
              {step.title.replace(/^\d+\.\s*/, "")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
