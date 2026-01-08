import { Probot } from "probot";
import { issueGreeting } from "./features/issue-greeting";
import { generatePullRequestSummary } from "./features/generate-pr-summary";

export default (app: Probot) => {
  app.on("issues.opened", async (context) => {
    const issueDetails = context.issue();
    await issueGreeting(context.octokit, issueDetails);
  });

  app.on("pull_request.opened", async (context) => {
    await generatePullRequestSummary(context);
  });
};
