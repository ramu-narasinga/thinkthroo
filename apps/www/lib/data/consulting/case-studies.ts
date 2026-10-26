import type { CaseStudy } from "./types";

/**
 * Case study content. Every entry here is a placeholder — fill in real
 * details from past work before these pages go live. See TODO.md.
 */
export const caseStudies: CaseStudy[] = [
  {
    slug: "support-chatbot",
    title: `{{TODO: case study title, e.g. "Support Chatbot Cut First-Response Time for a..."}}`,
    industry: `{{TODO: client industry, e.g. "E-commerce"}}`,
    summary: `{{TODO: one-sentence summary for the card view}}`,
    problem: `{{TODO: what problem the client had before this project}}`,
    whatIBuilt: `{{TODO: what you actually built - the agent/chatbot/pipeline, key features}}`,
    stack: [`{{TODO: e.g. Next.js}}`, `{{TODO: e.g. OpenAI API}}`, `{{TODO: e.g. Postgres}}`],
    result: `{{TODO: concrete, true result - no invented numbers}}`,
    screenshot: undefined,
  },
  {
    slug: "document-rag",
    title: `{{TODO: case study title for a RAG/document project}}`,
    industry: `{{TODO: client industry}}`,
    summary: `{{TODO: one-sentence summary for the card view}}`,
    problem: `{{TODO: what problem the client had before this project}}`,
    whatIBuilt: `{{TODO: what you built - ingestion pipeline, retrieval, chat UI, etc.}}`,
    stack: [`{{TODO: e.g. LangChain}}`, `{{TODO: e.g. pgvector}}`, `{{TODO: e.g. Claude API}}`],
    result: `{{TODO: concrete, true result - no invented numbers}}`,
    screenshot: undefined,
  },
  {
    slug: "internal-ai-app",
    title: `{{TODO: case study title for an internal AI app/tool}}`,
    industry: `{{TODO: client industry}}`,
    summary: `{{TODO: one-sentence summary for the card view}}`,
    problem: `{{TODO: what problem the client had before this project}}`,
    whatIBuilt: `{{TODO: what you built}}`,
    stack: [`{{TODO: stack item}}`, `{{TODO: stack item}}`],
    result: `{{TODO: concrete, true result - no invented numbers}}`,
    screenshot: undefined,
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
