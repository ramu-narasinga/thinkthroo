import { Card, CardContent, CardHeader, CardTitle } from "@thinkthroo/ui/components/card";
import { TodoText } from "../todo-text";
import type { LandingPageContent } from "@/lib/data/consulting/types";

export function Offer({ offer }: { offer: LandingPageContent["offer"] }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{offer.heading}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {offer.scope.map((item) => (
              <li key={item} className="flex gap-2 text-sm">
                <span aria-hidden className="text-muted-foreground">
                  →
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">{offer.timeline}</p>
          <p className="mt-2 text-xl font-semibold">
            <TodoText>{offer.priceLabel}</TodoText>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
