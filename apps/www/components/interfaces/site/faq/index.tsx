"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const FAQS = [
  {
    question: "What is ThinkThroo?",
    answer:
      "ThinkThroo is a platform that helps developers understand the architecture of large open-source projects like shadcn/ui and Supabase. We provide in-depth codebase walkthroughs, best practices, and patterns used in production-grade projects.",
  },
  {
    question: "Who is this for?",
    answer:
      "ThinkThroo is built for developers who want to level up by studying how top-tier open-source codebases are structured — whether you're a mid-level developer looking to grow or a senior engineer wanting to validate patterns.",
  },
  {
    question: "What open-source projects do you cover?",
    answer:
      "We currently cover shadcn/ui and Supabase codebase architectures, with more projects being added regularly. Each course walks through tooling, folder structure, patterns, and key architectural decisions.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes. The Open Source plan is free and gives you access to foundational content. Upgrade to Pro for full access to all codebase architecture courses and production-grade project deep-dives.",
  },
  {
    question: "How is this different from reading the source code myself?",
    answer:
      "Reading raw source code without context is time-consuming and often confusing. ThinkThroo curates and explains the why behind every architectural decision, saving you hours of reverse-engineering.",
  },
  {
    question: "Do you offer a newsletter?",
    answer:
      "Yes! Subscribe to our newsletter above to get a weekly summary of OSS code reviews, best practices, and patterns used in large open-source projects — straight to your inbox.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="max-w-[80rem] mt-24 mx-auto px-6 md:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-muted-foreground text-base max-w-xl mx-auto">
          Everything you need to know about ThinkThroo.
        </p>
      </div>

      <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
        {FAQS.map((faq, index) => (
          <div key={index}>
            <button
              className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/40 transition-colors"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              aria-expanded={openIndex === index}
            >
              <span className="font-medium text-foreground">{faq.question}</span>
              <ChevronDown
                className={cn(
                  "ml-4 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  openIndex === index && "rotate-180"
                )}
              />
            </button>
            {openIndex === index && (
              <div className="px-6 pb-5 text-muted-foreground text-sm leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
