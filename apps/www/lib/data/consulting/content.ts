import { consultingConfig } from "./config";
import type { ConsultingContent } from "./types";

export const consultingContent: ConsultingContent = {
  seoTitle: "AI Automation for Small US Businesses | Think Throo",
  seoDescription:
    "Custom AI automation, workflows, chatbots, and apps for small US businesses. Built by a senior dev team at a fixed price. Book a free 30-minute call.",

  hero: {
    h1: "Custom AI Automation for Small US Businesses",
    subhead:
      "Tell us the work that's eating your time. We build the AI workflow, chatbot, or app that handles it — connected to the tools you already use, at a fixed price.",
    trustLine: "4 years studying large open-source projects · Read our work before you book · Senior dev team",
  },

  caseStudy: {
    title: "Our portfolio is the proof",
    tagline:
      "4 years studying how large open-source projects are built — and we write up what we learn. Read it before you hire us.",
    whatWeBuilt: [
      "A blog and skills library built from studying real open-source codebases",
      "Architecture courses teaching the patterns behind them",
      "This lead form and booking flow — Supabase, Cal.com, and conversion tracking, end to end",
    ],
    stack: ["Next.js 16", "Tailwind CSS v4", "Supabase", "Cal.com"],
    result: "It's all live — read it, then judge the engineering yourself.",
  },

  offer: {
    heading: "Start with a fixed-price pilot",
    scope: [
      "One chatbot, agent, app feature, RAG pipeline, or delivery sprint — clearly scoped",
      "Connected to your tools or data where needed",
      "Delivered with docs, or kept running with ongoing support",
    ],
    timeline: "Typical pilot: 2-4 weeks.",
    priceLabel: `Projects from ${consultingConfig.pilotPriceFrom}`,
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
    heading: "Get a fixed price in 30 minutes",
    subhead: "Tell us what you need, then pick a time. The call is free.",
  },
};
