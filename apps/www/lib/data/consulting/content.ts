import { consultingConfig } from "./config";
import type { ConsultingContent } from "./types";

export const consultingContent: ConsultingContent = {
  seoTitle: "AI Development Services, Built by a Senior Engineer | Think Throo",
  seoDescription:
    "AI chatbots, agents, apps, RAG systems, and white-label delivery capacity for small US businesses and agencies, built by a senior engineer at a fixed price.",

  hero: {
    h1: "AI Development, Built by a Senior Engineer",
    subhead:
      "Chatbots and agents, AI-powered apps, RAG and document search, or extra delivery capacity for your agency — scoped, priced, and built by the person you talk to.",
    primaryCtaLabel: "Book a free 20-min scoping call",
    secondaryCtaLabel: "See pricing and process",
  },

  caseStudy: {
    title: "This platform — thinkthroo.com",
    tagline: "Built and still running the same way client work gets built.",
    problem:
      "Case studies are easy to write and hard to verify. Instead of a client story you can't check, here's a system you can open yourself right now.",
    whatIBuilt: [
      "A content platform with a blog engine, a docs engine, and a searchable skills/components catalog",
      "A courses area teaching architecture patterns pulled from real open-source codebases, like shadcn/ui and Supabase",
      "This page and its lead flow — honeypot spam filtering, Supabase storage, Slack notifications, and Google Ads conversion tracking with Enhanced Conversions",
      `The booking step you'd use to talk to ${consultingConfig.engineerName} — Cal.com embedded directly, with booking confirmation wired into analytics`,
    ],
    stack: ["Next.js 16", "Tailwind CSS v4", "Supabase", "Cal.com"],
    result:
      "No case study page needed — you're already looking at the one that counts.",
  },

  offer: {
    heading: "Start with a fixed-price pilot",
    scope: [
      "One chatbot, agent, app feature, RAG pipeline, or delivery sprint — scoped to a specific, well-defined job",
      "Connected to your existing data or tools where needed (docs, CRM, helpdesk, Slack, or your own codebase)",
      "Deployed and handed over with docs, or kept running with ongoing support — your choice",
    ],
    timeline: "Typical pilot: 2-4 weeks from signed proposal to working demo.",
    priceLabel: `Projects from ${consultingConfig.pilotPriceFrom}`,
  },

  process: [
    {
      title: "1. Scoping call",
      description:
        "20 minutes on a video call. You describe what you need — a client-facing feature or extra delivery capacity for your team — and I ask the questions that decide feasibility and rough timeline.",
    },
    {
      title: "2. Fixed-scope proposal",
      description:
        "A short written proposal: exactly what gets built, what's out of scope, timeline, and a fixed price. No hourly surprises.",
    },
    {
      title: "3. Build and demo",
      description:
        "I build in short checkpoints and demo progress on calls during US working hours, so you're never waiting a week to see something.",
    },
    {
      title: "4. Handover or iterate",
      description:
        "You get the code, docs, and a walkthrough. Keep me on for iteration and support, or take it in-house — your choice.",
    },
  ],

  indiaAngle: {
    heading: "Built in India, run on US hours",
    body: [
      "I'm a solo senior engineer based in India. That means lower rates than a comparable US contractor or agency, without going through a staffing layer.",
      "I keep hours that overlap with US business hours for calls and demos, so this works like working with a contractor down the street, not an outsourced ticket queue.",
      "If you're an agency or small IT firm sending work offshore, the same applies: I work inside your repo and standards under NDA, white-label by default — you stay the client's point of contact.",
    ],
  },

  faq: [
    {
      question: "What exactly counts as an 'agent' vs a 'chatbot' here?",
      answer:
        "A chatbot answers questions and follows a script. An agent takes actions — looking things up, calling APIs, updating a record — based on what the user asks. Most projects start as a chatbot and grow agent-like capabilities as the scope allows.",
    },
    {
      question: "Do you work with an existing codebase, or only greenfield?",
      answer:
        "Both. Plenty of this work is adding an AI feature into an app that already exists. We'll review your codebase on the scoping call to confirm it's a reasonable fit before scoping anything.",
    },
    {
      question: "How do you stop a RAG system from making things up?",
      answer:
        "It's built to answer only from retrieved passages of your documents and to say when it doesn't have an answer, rather than guessing. We test this explicitly before handover.",
    },
    {
      question: "We're an agency — will you ever contact our client directly?",
      answer:
        "No. You own the client relationship. I work behind the scenes under your brand, under NDA, and all client communication stays with you unless you explicitly want it otherwise.",
    },
    {
      question: "Who actually builds it?",
      answer:
        "I do. I'm a solo senior engineer — no bench of junior devs, no handoffs between sales and delivery. The person on the scoping call is the person writing the code.",
    },
    {
      question: "How does pricing work?",
      answer:
        `Pilots start at ${consultingConfig.pilotPriceFrom} for a fixed, agreed scope. You get a written proposal with the price before any work starts — no hourly billing, no surprise invoices.`,
    },
    {
      question: "What if it doesn't work out?",
      answer:
        "The pilot has a defined scope and timeline, so we both know upfront what 'done' looks like. If something's clearly not feasible once we dig in, I'll tell you before you pay for a full build — not after.",
    },
    {
      question: "Who owns the code and IP?",
      answer:
        "You do, fully, once the project is paid for. There's no retained license, no 'powered by' requirement, no lock-in to keep me engaged.",
    },
    {
      question: "How do timezone and communication work day to day?",
      answer:
        "I overlap several hours with US business hours for live calls. Outside that window, updates happen async over Slack or email, with clear written notes so nothing gets lost waiting for a call.",
    },
    {
      question: "How is data security and confidentiality handled?",
      answer:
        "I'll sign an NDA before seeing any sensitive data or code. For projects involving customer data, we agree up front on what data I need access to and how it's handled — least access, not full production dumps by default.",
    },
  ],

  booking: {
    heading: "Ready to talk?",
    subhead: "Tell me what you need, then pick a time — I'll see your details before the call.",
  },
};
