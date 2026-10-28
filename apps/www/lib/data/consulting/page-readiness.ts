import { consultingConfig } from "./config";
import { hasUnresolvedTodo } from "./todo-check";
import type { ConsultingContent } from "./types";

/**
 * The page is safe to index only once its own content and the global
 * bio/price placeholders are free of {{TODO}} markers.
 */
export function pageIsIndexable(content: ConsultingContent): boolean {
  if (hasUnresolvedTodo(content)) return false;
  if (hasUnresolvedTodo(consultingConfig)) return false;
  return true;
}
