import { TodoText } from "../todo-text";
import { SectionHeading } from "../section-heading";
import type { ConsultingContent } from "@/lib/data/consulting/types";

export function Offer({ offer }: { offer: ConsultingContent["offer"] }) {
  return (
    <section id="offer" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading badge="Offer" title={offer.heading} />
      <div className="rounded-2xl border border-border/50 bg-card/30 p-8 lg:p-10">
        <ul className="space-y-3">
          {offer.scope.map((item) => (
            <li key={item} className="flex gap-3 text-sm text-foreground">
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
        <p className="mt-6 text-sm text-muted-foreground">{offer.timeline}</p>
        <p className="mt-2 text-xl font-semibold text-foreground">
          <TodoText>{offer.priceLabel}</TodoText>
        </p>
      </div>
    </section>
  );
}
