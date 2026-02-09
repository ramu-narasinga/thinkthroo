import type { Context } from "probot";
import { PullRequestSummaryGenerator } from "./PullRequestSummaryGenerator";

export async function generatePullRequestSummary(
  context: Context<"pull_request">
): Promise<void> {
  const generator = new PullRequestSummaryGenerator(context);
  await generator.generate();
}
