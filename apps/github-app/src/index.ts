import { initPostHogLogs } from "./utils/posthog-logs";

initPostHogLogs();

import { Probot } from "probot";
import { greetIssue } from "./features/issue-greeting";
import { PRWorkflowOrchestrator } from "./features/pr-workflow";
import { MarketplaceService } from "./services/marketplace/MarketplaceService";
import { InviteGateService } from "./services/invite/InviteGateService";
import { PRCommandHandler } from "./features/pr-command/PRCommandHandler";
import { logger } from "@/utils/logger";
import { SlackNotifier } from "@/utils/slack";

export default (app: Probot) => {
  logger.info("GitHub App initialized", { appName: "think-throo" });

  app.on("installation.created", async (context) => {
    const { installation, repositories } = context.payload;
    const account = installation.account;
    logger.info("App installed", {
      accountLogin: account.login,
      accountType: account.type,
      repoCount: repositories?.length ?? 0,
    });
    await SlackNotifier.appInstalled(account.login, account.type, repositories?.length ?? 0);
  });

  app.on("installation.deleted", async (context) => {
    const { installation } = context.payload;
    const account = installation.account;
    logger.info("App uninstalled", {
      accountLogin: account.login,
      accountType: account.type,
    });
    await SlackNotifier.appUninstalled(account.login, account.type);
  });

  app.on("issues.opened", async (context) => {
    const issueDetails = context.issue();
    logger.info("Issue opened event received", {
      owner: issueDetails.owner,
      repo: issueDetails.repo,
      issueNumber: issueDetails.issue_number,
    });

    try {
      await greetIssue(context);
      logger.info("Issue greeting completed", { issueNumber: issueDetails.issue_number });
    } catch (error: any) {
      logger.error("Failed to post issue greeting", {
        issueNumber: issueDetails.issue_number,
        error: error.message,
      });
      throw error;
    }
  });

  app.on(["pull_request.opened", "pull_request.reopened", "pull_request.synchronize"], async (context) => {
    const pullRequest = context.payload.pull_request;
    const eventAction = context.payload.action;
    
    logger.info("Pull request event received", {
      action: eventAction,
      owner: context.repo().owner,
      repo: context.repo().repo,
      prNumber: pullRequest.number,
      prTitle: pullRequest.title,
      author: pullRequest.user?.login,
      baseBranch: pullRequest.base.ref,
      headBranch: pullRequest.head.ref,
    });

    try {
      // Invite gate: check if the PR author is on the invite list
      const prAuthor = pullRequest.user?.login;
      const repoOwner = context.repo().owner;

      // Check both the PR author and the repo owner (org)
      const authorAllowed = prAuthor ? await InviteGateService.isAllowed(prAuthor) : false;
      const ownerAllowed = await InviteGateService.isAllowed(repoOwner);

      if (!authorAllowed && !ownerAllowed) {
        logger.info("PR author/owner not on invite list, skipping AI review", {
          prNumber: pullRequest.number,
          prAuthor,
          repoOwner,
        });

        // Post a comment on the PR explaining the invite-only restriction
        await context.octokit.issues.createComment({
          ...context.repo(),
          issue_number: pullRequest.number,
          body: InviteGateService.buildNotInvitedComment(prAuthor || repoOwner),
        });

        return;
      }

      const orchestrator = new PRWorkflowOrchestrator(context);
      
      await orchestrator.execute({
        generateSummaries: true,
        useSummaryFiltering: true,
        reviewOptions: {
          maxFiles: 50,
          maxConcurrency: 5,
          debug: false,
        },
      });
      
      logger.info("PR workflow completed", { prNumber: pullRequest.number });
    } catch (error: any) {
      logger.error("Failed to complete PR workflow", {
        prNumber: pullRequest.number,
        error: error.message,
        stack: error.stack,
      });
    }
  });

  app.on("issue_comment.created", async (context) => {
    try {
      await new PRCommandHandler(context).handle();
    } catch (error: any) {
      logger.error("Failed to handle PR command", {
        error: error.message,
        stack: error.stack,
      });
    }
  });

  app.on(
    ["marketplace_purchase.purchased", "marketplace_purchase.changed", "marketplace_purchase.cancelled"],
    async (context) => {
      logger.info("Marketplace purchase event received", {
        action: context.payload.action,
        accountId: context.payload.marketplace_purchase.account.id,
        accountLogin: context.payload.marketplace_purchase.account.login,
        planName: context.payload.marketplace_purchase.plan.name,
      });

      try {

        const marketplaceService = new MarketplaceService();

        await marketplaceService.handleMarketplacePurchase(context);
        logger.info("Marketplace purchase handled successfully", {
          action: context.payload.action,
          accountId: context.payload.marketplace_purchase.account.id,
        });
      } catch (error: any) {
        logger.error("Failed to handle marketplace purchase", {
          action: context.payload.action,
          accountId: context.payload.marketplace_purchase.account.id,
          error: error.message,
          stack: error.stack,
        });
      }
    }
  );
};
