// https://github.com/aayushchugh/repo-command/blob/main/src/index.ts
import { ProbotOctokit } from "probot";
import { issueGreetingBodyText } from "@/utils/constants";
import { IssueDetails } from "@/types/issue";

export async function issueGreeting(
  octokit: InstanceType<typeof ProbotOctokit>,
  issueDetails: IssueDetails
) {
  return octokit.issues.createComment({
    ...issueDetails,
    body: issueGreetingBodyText,
  });
}