import type { LandingPageContent } from "@/lib/data/consulting/types";

export function IndiaAngle({
  indiaAngle,
}: {
  indiaAngle: LandingPageContent["indiaAngle"];
}) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <h2 className="text-2xl font-semibold">{indiaAngle.heading}</h2>
      <div className="mt-4 space-y-4 text-muted-foreground">
        {indiaAngle.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
