import { consultingConfig } from "./config";
import type { LandingPageContent } from "./types";

const sharedProcess = [
  {
    title: "1. Scoping call",
    description:
      "20 minutes on a video call. You describe what you need, I ask the questions that decide whether it's feasible and roughly how long it'll take.",
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
];

const sharedIndiaAngle = {
  heading: "Built in India, run on US hours",
  body: [
    "I'm a solo senior engineer based in India. That means lower rates than a comparable US contractor or agency, without going through a staffing layer.",
    "I keep hours that overlap with US business hours for calls and demos, so this works like working with a contractor down the street, not an outsourced ticket queue.",
    "Communication is direct and in English: scoping call, written proposal, async updates on Slack or email, and live demos. You talk to the person writing the code, not an account manager relaying messages.",
  ],
};

const sharedFaqTail = [
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
];

export const landingPages: Record<string, LandingPageContent> = {
  "ai-chatbots-agents": {
    slug: "ai-chatbots-agents",
    adGroups: ["ai chatbot development services", "custom ai agent development"],
    seoTitle: "AI Chatbots and Agents, Built by a Senior Engineer | Think Throo",
    seoDescription:
      "Custom AI chatbots and agents for small US businesses, built by a senior engineer in India. Fixed-price pilots, direct access to the person building it.",
    hero: {
      h1: "AI Chatbots and Agents, Built by a Senior Engineer",
      subhead:
        "A custom chatbot or agent for your business — handling support, bookings, or internal workflows — scoped, priced, and built by the person you talk to.",
      primaryCtaLabel: "Book a free 20-min scoping call",
      secondaryCtaLabel: "See pricing and process",
    },
    caseStudySlugs: ["support-chatbot", "internal-ai-app"],
    offer: {
      heading: "Start with a fixed-price pilot",
      scope: [
        "One chatbot or agent, scoped to a specific job (support, lead intake, internal lookup, or similar)",
        "Connected to your existing data or tools where needed (docs, CRM, helpdesk, Slack)",
        "Deployed and handed over with basic docs, or kept running with ongoing support",
      ],
      timeline: "Typical pilot: 2-4 weeks from signed proposal to working demo.",
      priceLabel: `Projects from ${consultingConfig.pilotPriceFrom}`,
    },
    process: sharedProcess,
    indiaAngle: sharedIndiaAngle,
    faq: [
      {
        question: "What exactly counts as an 'agent' vs a 'chatbot' here?",
        answer:
          "A chatbot answers questions and follows a script. An agent takes actions — looking things up, calling APIs, updating a record — based on what the user asks. Most projects start as a chatbot and grow agent-like capabilities as the scope allows.",
      },
      {
        question: "Can it connect to our existing tools (CRM, helpdesk, Slack)?",
        answer:
          "Usually yes, as long as the tool has an API or a reasonable export. We'll confirm exactly what's connectable on the scoping call before anything is priced.",
      },
      ...sharedFaqTail,
    ],
    finalCta: {
      heading: "Ready to scope your chatbot or agent?",
      subhead: "20 minutes, no pitch deck. Just a conversation about what you need.",
    },
  },

  "ai-app-development": {
    slug: "ai-app-development",
    adGroups: ["ai app development", "custom ai software development"],
    seoTitle: "AI Apps Built to Scope, at a Fixed Price | Think Throo",
    seoDescription:
      "Custom AI-powered applications for small US businesses, scoped and built by a senior engineer at a fixed price.",
    hero: {
      h1: "AI Apps Built to Scope, at a Fixed Price",
      subhead:
        "A working AI-powered application — internal tool, customer-facing feature, or full product — built from a written scope, not an open-ended hourly contract.",
      primaryCtaLabel: "Book a free 20-min scoping call",
      secondaryCtaLabel: "See pricing and process",
    },
    caseStudySlugs: ["internal-ai-app", "support-chatbot"],
    offer: {
      heading: "Start with a fixed-price pilot",
      scope: [
        "One well-defined feature or internal tool with AI at its core",
        "A working demo you can put in front of real users before committing further",
        "Clean handover: code, docs, and a walkthrough of how it's built",
      ],
      timeline: "Typical pilot: 2-5 weeks depending on scope, agreed upfront.",
      priceLabel: `Projects from ${consultingConfig.pilotPriceFrom}`,
    },
    process: sharedProcess,
    indiaAngle: sharedIndiaAngle,
    faq: [
      {
        question: "Do you work with an existing codebase, or only greenfield?",
        answer:
          "Both. Plenty of this work is adding an AI feature into an app that already exists. We'll review your codebase on the scoping call to confirm it's a reasonable fit before scoping anything.",
      },
      {
        question: "What AI providers or models do you use?",
        answer:
          "Whichever fits the job and your budget — typically OpenAI, Anthropic, or open-weight models self-hosted when that's a better fit. I'm not tied to one vendor.",
      },
      ...sharedFaqTail,
    ],
    finalCta: {
      heading: "Ready to scope your AI app?",
      subhead: "20 minutes, no pitch deck. Just a conversation about what you need.",
    },
  },

  "rag-document-ai": {
    slug: "rag-document-ai",
    adGroups: ["rag development services", "document ai for business"],
    seoTitle: "RAG: Let Your Team Chat With Your Own Documents | Think Throo",
    seoDescription:
      "Retrieval-augmented AI that lets your team search and chat with your own documents, built by a senior engineer at a fixed price.",
    hero: {
      h1: "RAG: Let Your Team Chat With Your Own Documents",
      subhead:
        "Turn your PDFs, manuals, contracts, or knowledge base into a system your team can actually ask questions against — with answers grounded in your own documents.",
      primaryCtaLabel: "Book a free 20-min scoping call",
      secondaryCtaLabel: "See pricing and process",
    },
    caseStudySlugs: ["document-rag", "internal-ai-app"],
    offer: {
      heading: "Start with a fixed-price pilot",
      scope: [
        "Document ingestion pipeline for your existing files (PDFs, docs, spreadsheets, or a knowledge base export)",
        "A search/chat interface your team can use, with answers tied back to source documents",
        "Guardrails against the system confidently answering from outside your documents",
      ],
      timeline: "Typical pilot: 2-4 weeks, depending on document volume and formats.",
      priceLabel: `Projects from ${consultingConfig.pilotPriceFrom}`,
    },
    process: sharedProcess,
    indiaAngle: sharedIndiaAngle,
    faq: [
      {
        question: "What document formats can this handle?",
        answer:
          "PDFs, Word docs, spreadsheets, HTML, and most text-based formats. Scanned documents need OCR first, which we'll account for in scoping if that applies to you.",
      },
      {
        question: "How do you stop it from making things up?",
        answer:
          "The system is built to answer only from retrieved passages of your documents and to say when it doesn't have an answer, rather than guessing. We test this explicitly before handover.",
      },
      ...sharedFaqTail,
    ],
    finalCta: {
      heading: "Ready to make your documents searchable?",
      subhead: "20 minutes, no pitch deck. Just a conversation about what you need.",
    },
  },

  "white-label-ai-development": {
    slug: "white-label-ai-development",
    adGroups: ["white label ai development", "offshore ai development partner"],
    seoTitle: "Offshore AI Delivery for Small IT Firms, Under Your Brand | Think Throo",
    seoDescription:
      "Extra AI/ML delivery capacity for small IT and AI firms, white-labeled under your brand, billed per project.",
    hero: {
      h1: "Offshore AI Delivery for Small IT Firms, Under Your Brand",
      subhead:
        "Extra hands for AI and agent builds when your team is stretched — delivered under your brand, with you owning the client relationship.",
      primaryCtaLabel: "Book a free 20-min scoping call",
      secondaryCtaLabel: "See pricing and process",
    },
    caseStudySlugs: ["internal-ai-app", "document-rag"],
    offer: {
      heading: "Start with a fixed-price trial project",
      scope: [
        "One client project or internal build taken off your plate, delivered to your spec and your coding standards",
        "You stay the client-facing point of contact; I work as delivery capacity behind the scenes",
        "Clean, documented code so your team can review, extend, or maintain it directly",
      ],
      timeline: "Typical trial project: 2-4 weeks, scoped around your deadline.",
      priceLabel: `Projects from ${consultingConfig.pilotPriceFrom}`,
    },
    process: [
      {
        title: "1. Capacity call",
        description:
          "20 minutes on what you need offloaded, your standards and stack, and how you want client communication handled.",
      },
      {
        title: "2. Fixed-scope agreement",
        description:
          "A written scope and price for the specific project or sprint of work, under an NDA and (if needed) a white-label agreement.",
      },
      {
        title: "3. Build against your standards",
        description:
          "I work inside your repo and conventions where possible, with progress updates on your schedule, not mine.",
      },
      {
        title: "4. Deliver to you",
        description:
          "Code and documentation go to you, not your client directly — you control what gets delivered and how.",
      },
    ],
    indiaAngle: {
      heading: "Capacity, not a staffing agency markup",
      body: [
        "I'm a solo senior engineer, not an agency with a bench and a markup on every hour. You're getting direct delivery capacity at India-based rates, without a staffing layer in between.",
        "Work happens with overlap into US business hours, so your team can review and redirect quickly instead of losing a day each round trip.",
        "Everything is white-label by default — NDA upfront, no 'built by Think Throo' anywhere a client would see it, and you stay the point of contact for your client.",
      ],
    },
    faq: [
      {
        question: "Will you ever contact our client directly?",
        answer:
          "No. You own the client relationship. I work behind the scenes under your brand, under NDA, and all client communication stays with you unless you explicitly want it otherwise.",
      },
      {
        question: "Can you work inside our codebase and conventions?",
        answer:
          "Yes — that's usually the point. On the capacity call we'll look at your repo, standards, and review process so the work fits your team's workflow, not the other way around.",
      },
      ...sharedFaqTail,
    ],
    finalCta: {
      heading: "Need extra AI delivery capacity?",
      subhead: "20 minutes, no pitch deck. Just a conversation about what you need offloaded.",
    },
  },
};

export function getLandingPage(slug: string): LandingPageContent | undefined {
  return landingPages[slug];
}
