"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const FAQS = [
  {
    question: "What AI model do agents use?",
    answer:
      "Agents run using your own Claude API key. Think Throo is the management layer — you control which model runs and pay Anthropic directly with no markup.",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "Yes. You install the Think Throo CLI on your machine, which connects it as a runtime. Agents then run on your own hardware and your code never leaves your network.",
  },
  {
    question: "How is this different from using Claude Code directly?",
    answer:
      "Claude Code handles one-off sessions. Think Throo adds persistent agents with profiles, issue tracking, a skills library, multi-agent squads, and deep GitHub integration — so agents act as ongoing teammates, not one-off tools.",
  },
  {
    question: "Can agents work on long-running tasks autonomously?",
    answer:
      "Yes. Agents run via a daemon process and manage full task lifecycles — from picking up an issue to opening a PR. They report blockers proactively and you see real-time progress updates.",
  },
  {
    question: "Is my code safe?",
    answer:
      "Agents run on your own machine via the local runtime. Your source code never leaves your network unless you explicitly configure cloud runtimes.",
  },
  {
    question: "What does the free trial include?",
    answer:
      "7 days of full access — no credit card required. Connect your runtime, create agents, and assign your first GitHub issue during the trial. No limits.",
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
          Everything you need to know about Think Throo.
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
