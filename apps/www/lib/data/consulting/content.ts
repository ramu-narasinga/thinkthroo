import { consultingConfig } from "./config";
import type { ConsultingContent } from "./types";

export const consultingContent: ConsultingContent = {
  seoTitle: "Custom AI Automation for Businesses | Think Throo",
  seoDescription:
    "Custom AI automation, workflows, chatbots, and apps for your business, at a fixed price. Book a free 30-minute call to scope it.",

  hero: {
    h1: "Custom AI Automation for Businesses",
    subhead:
      "Tell us the work that's eating your time. We build the AI workflow, chatbot, or app that handles it — connected to the tools you already use, at a fixed price.",
    trustLine: "Backed by 4 years of studying how large open-source projects are built. Read our work before you book.",
  },

  caseStudies: {
    title: "Our portfolio is the proof",
    tagline: "Two products we built ourselves, and how they work under the hood.",
    items: [
      {
        label: "Content platform",
        title: "How the Think Throo blog is built",
        summary:
          "Writers work in an editor, not in code. Every article is pre-built for speed and ships with search and social-sharing previews.",
        howItWorks: [
          "Articles are written in a hosted editor (Sanity) — no code needed to publish.",
          "Each article is pre-built as a static page, so it loads fast.",
          "The sidebar, table of contents, and sharing previews generate themselves from the content.",
          "Email sign-up and in-article prompts capture readers who want more.",
        ],
        stack: ["Next.js", "Sanity CMS", "Tailwind CSS", "Supabase"],
        result:
          "The same approach works for your site: your team updates content from a simple editor, and visitors get fast pages.",
      },
      {
        label: "AI agents",
        title: "How the Think Throo software factory is built",
        summary:
          "AI agents take a written task and hand back a pull request to review, with a person in control at every step.",
        howItWorks: [
          "Assign a task to an agent. It plans, writes code, adds tests, or reviews a pull request.",
          "Agents run on a machine you control — nothing executes on our servers.",
          "Every step is recorded in a transcript you can follow. You set how much freedom the agent has, and it stops to ask when something's unclear.",
          "A companion GitHub app reviews pull requests against codebase-architecture standards.",
        ],
        stack: ["Next.js", "tRPC", "Postgres", "Claude Code", "GitHub App", "Upstash"],
        result:
          "The same pattern works for your business: AI does the task, shows its work, and checks in before it matters.",
      },
    ],
    footnote:
      "Even the form on this page is a small automation: your details reach our team instantly, then you pick a time on our calendar.",
  },

  offer: {
    heading: "Start with a fixed-price pilot",
    scope: [
      "One automation, AI workflow, chatbot, document search, or app feature — clearly scoped",
      "Connected to your tools or data where needed",
      "Delivered with docs, or kept running with ongoing support",
    ],
    timeline: "Typical pilot: 2-4 weeks.",
    priceLabel: `Projects start at ${consultingConfig.pilotPriceFrom}`,
    priceNote: "Fixed price, agreed before any work starts.",
  },

  process: [
    {
      title: "1. Scoping call",
      description: "30 minutes on a call. You describe what you need, we confirm feasibility and rough timeline.",
    },
    {
      title: "2. Fixed-scope proposal",
      description: "A short written proposal: scope, timeline, fixed price. No hourly surprises.",
    },
    {
      title: "3. Build and demo",
      description: "We build in short checkpoints and demo progress on calls during US hours.",
    },
    {
      title: "4. Handover or iterate",
      description: "You get the code, docs, and a walkthrough. Keep us on, or take it in-house.",
    },
  ],

  faq: [
    {
      question: "Who actually builds it?",
      answer:
        "A small team of senior engineers. The people on the scoping call are the people writing the code — no sales-to-delivery handoff.",
    },
    {
      question: "Do you work with an existing codebase, or only greenfield?",
      answer:
        "Both. We'll review your codebase on the scoping call to confirm it's a reasonable fit before scoping anything.",
    },
    {
      question: "How do you stop a RAG system from making things up?",
      answer:
        "It's built to answer only from retrieved passages of your documents and to say when it doesn't have an answer. We test this explicitly before handover.",
    },
    {
      question: "We're an agency — will you ever contact our client directly?",
      answer:
        "No. You own the client relationship. We work behind the scenes under your brand, under NDA.",
    },
    {
      question: "How does pricing work?",
      answer: `Pilots start at ${consultingConfig.pilotPriceFrom} for a fixed, agreed scope — priced before any work starts.`,
    },
    {
      question: "Who owns the code and IP?",
      answer: "You do, fully, once the project is paid for. No retained license, no lock-in.",
    },
    {
      question: "How is data security and confidentiality handled?",
      answer: "We sign an NDA before seeing any sensitive data or code, with access scoped to what the project needs.",
    },
  ],

  booking: {
    heading: "Find out what AI can automate in your business",
    subhead:
      "Free 30-minute call. Tell us what's slowing you down — we'll map the fix and follow up with a fixed price.",
  },
};
