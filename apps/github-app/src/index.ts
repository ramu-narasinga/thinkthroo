import "./utils/sentry";

import { Probot } from "probot";
import { issueGreeting } from "./features/issue-greeting";
import { PRWorkflowOrchestrator } from "./features/pr-workflow";
import { MarketplaceService } from "./services/marketplace/MarketplaceService";
import { logger } from "@/utils/logger";

export default (app: Probot) => {
  logger.info("GitHub App initialized", { appName: "think-throo" });

  app.on("issues.opened", async (context) => {
    const issueDetails = context.issue();
    logger.info("Issue opened event received", {
      owner: issueDetails.owner,
      repo: issueDetails.repo,
      issueNumber: issueDetails.issue_number,
    });

    try {
      await issueGreeting(context.octokit, issueDetails);
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
      const orchestrator = new PRWorkflowOrchestrator(context);
      
      await orchestrator.execute({
        generateSummaries: true,
        useSummaryFiltering: true,
        reviewOptions: {
          maxFiles: 50,
          maxConcurrency: 5,
          reviewCommentLGTM: false,
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
