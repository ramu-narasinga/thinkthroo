import { consultingConfig } from "./config";
import { getCaseStudy } from "./case-studies";
import { hasUnresolvedTodo } from "./todo-check";
import type { LandingPageContent } from "./types";

/**
 * A page is safe to index only once its own content, the global bio/price
 * placeholders, and every case study it links to are free of {{TODO}} markers.
 */
export function pageIsIndexable(content: LandingPageContent): boolean {
  if (hasUnresolvedTodo(content)) return false;
  if (hasUnresolvedTodo(consultingConfig)) return false;

  const referencedCaseStudies = content.caseStudySlugs
    .map(getCaseStudy)
    .filter(Boolean);

  return !referencedCaseStudies.some(hasUnresolvedTodo);
}
