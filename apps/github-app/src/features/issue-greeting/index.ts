// https://github.com/jahredhope/grandbot/blob/db0b12734985913e173a9afcf993003d4f29d6cb/src/feature/on-open.ts
import { Probot, ProbotOctokit } from "probot";
import { issueGreetingBodyText } from "../../config";

function addGreetingComment(
  octokit: InstanceType<typeof ProbotOctokit>,
  issueDetails: { owner: string; repo: string; issue_number: number }
) {
  return octokit.issues.createComment({
    ...issueDetails,
    body: issueGreetingBodyText,
  });
}

export function useIssueGreeting(app: Probot) {
  app.on("issues.opened", async (context) => {
    const issueDetails = context.issue();
    await addGreetingComment(context.octokit, issueDetails);
  });
}