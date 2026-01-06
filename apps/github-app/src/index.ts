import { Probot } from "probot";
import { useIssueGreeting } from "./features/issue-greeting";

export default (app: Probot) => {
  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    await context.octokit.issues.createComment(issueComment);
  });

  useIssueGreeting(app);
};
