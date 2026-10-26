import { TODO_PREFIX } from "./config";

/** Recursively checks any content value (string, array, object) for an unresolved {{TODO...}} placeholder. */
export function hasUnresolvedTodo(value: unknown): boolean {
  if (typeof value === "string") {
    return value.includes(TODO_PREFIX);
  }
  if (Array.isArray(value)) {
    return value.some(hasUnresolvedTodo);
  }
  if (value && typeof value === "object") {
    return Object.values(value).some(hasUnresolvedTodo);
  }
  return false;
}
