export interface FaqItem {
  question: string;
  answer: string;
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface CaseStudyContent {
  title: string;
  tagline: string;
  whatWeBuilt: string[];
  stack: string[];
  result: string;
}

export interface ConsultingContent {
  seoTitle: string;
  seoDescription: string;
  hero: {
    h1: string;
    subhead: string;
    trustLine: string;
  };
  caseStudy: CaseStudyContent;
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
