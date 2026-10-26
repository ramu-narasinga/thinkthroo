export interface FaqItem {
  question: string;
  answer: string;
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  industry: string;
  summary: string;
  problem: string;
  whatIBuilt: string;
  stack: string[];
  result: string;
  screenshot?: string;
}

export interface LandingPageContent {
  slug: string;
  /** Google Ads ad group(s) this page targets, for reference only. */
  adGroups: string[];
  seoTitle: string;
  seoDescription: string;
  hero: {
    h1: string;
    subhead: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
  };
  caseStudySlugs: string[];
  offer: {
    heading: string;
    scope: string[];
    timeline: string;
    priceLabel: string;
  };
  process: ProcessStep[];
  indiaAngle: {
    heading: string;
    body: string[];
  };
  faq: FaqItem[];
  finalCta: {
    heading: string;
    subhead: string;
  };
}
