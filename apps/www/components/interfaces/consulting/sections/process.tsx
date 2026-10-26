import type { ProcessStep } from "@/lib/data/consulting/types";

export function Process({ steps }: { steps: ProcessStep[] }) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h2 className="text-center text-2xl font-semibold">How it works</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <div key={step.title}>
            <h3 className="font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
