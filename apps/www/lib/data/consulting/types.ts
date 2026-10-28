export interface FaqItem {
  question: string;
  answer: string;
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface CaseStudy {
  /** Short category tag shown above the title, e.g. "AI agents". */
  label: string;
  title: string;
  summary: string;
  howItWorks: string[];
  stack: string[];
  result: string;
}

export interface CaseStudiesContent {
  title: string;
  tagline: string;
  items: CaseStudy[];
  footnote: string;
}

export interface ConsultingContent {
  seoTitle: string;
  seoDescription: string;
  hero: {
    h1: string;
    subhead: string;
    trustLine: string;
    /** Desktop-only blocks that fill the column beside the form. */
    callBenefits: { heading: string; items: string[] };
    ideas: { heading: string; items: string[] };
  };
  caseStudies: CaseStudiesContent;
  offer: {
    heading: string;
    scope: string[];
    timeline: string;
    priceLabel: string;
  };
  process: ProcessStep[];
  faq: FaqItem[];
  booking: {
    heading: string;
    subhead: string;
  };
}
