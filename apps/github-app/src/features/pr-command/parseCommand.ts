export type Command = "pause" | "resume" | "review" | "full-review" | "summary" | "help";

export const BOT_NAME = "@thinkthroo";

/**
 * Parses a comment body and returns the matching @thinkthroo command, or null if none found.
 * "full review" is tested before "review" to avoid a partial match.
 */
export function parseCommand(body: string): Command | null {
  const lower = body.trim().toLowerCase();
  if (lower.includes(`${BOT_NAME} full review`)) return "full-review";
  if (lower.includes(`${BOT_NAME} pause`)) return "pause";
  if (lower.includes(`${BOT_NAME} resume`)) return "resume";
  if (lower.includes(`${BOT_NAME} review`)) return "review";
  if (lower.includes(`${BOT_NAME} summary`)) return "summary";
  if (lower.includes(`${BOT_NAME} help`)) return "help";
  return null;
}
