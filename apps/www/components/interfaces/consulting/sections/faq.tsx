import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@thinkthroo/ui/components/accordion";
import type { FaqItem } from "@/lib/data/consulting/types";

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <h2 className="text-center text-2xl font-semibold">
        Frequently asked questions
      </h2>
      <Accordion type="single" collapsible className="mt-8">
        {items.map((item) => (
          <AccordionItem key={item.question} value={item.question}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
