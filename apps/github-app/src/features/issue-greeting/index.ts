import type { Context } from "probot";
import { IssueGreetingService } from "@/services/issue-greeting/IssueGreetingService";

export async function greetIssue(
  context: Context<"issues.opened">
): Promise<void> {
  const service = new IssueGreetingService(context);
  await service.greet();
}