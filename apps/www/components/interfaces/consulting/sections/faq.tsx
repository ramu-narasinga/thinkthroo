"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { GridBackground } from "../grid-background";
import { SectionHeading } from "../section-heading";
import type { FaqItem } from "@/lib/data/consulting/types";

export function Faq({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative w-full">
      <GridBackground />

      <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading badge="FAQ" title="Frequently asked questions" />
        <div className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xl shadow-black/5 dark:shadow-black/30">
          {items.map((item, index) => (
            <div key={item.question}>
              <button
                type="button"
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/40 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
              >
                <span className="font-medium text-foreground">{item.question}</span>
                <ChevronDown
                  className={cn(
                    "ml-4 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 text-muted-foreground text-sm leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
