import type { Context } from "probot";
import pLimit from "p-limit";
import { ClaudeBot } from "@/services/ai/ClaudeBot";
import { Prompts } from "@/services/ai/Prompts";
import type { TemplateData } from "@/services/ai/Prompts";
import { ReviewCommentManager } from "@/services/reviews/ReviewCommentManager";
import { ReviewParser } from "@/services/reviews/ReviewParser";
import type { ReviewComment } from "@/services/reviews/ReviewParser";
import { PRPreprocessor } from "@/services/preprocessing/PRPreprocessor";
import { ArchitectureService } from "@/services/architecture/ArchitectureService";
import { CommentManager } from "@/services/comments/CommentManager";
import { getDefaultAIOptions, type BotAccumulatedUsage } from "@/services/ai/types";
import { calculateCostUsd, calculateCredits } from "@/services/ai/pricing";
import { ARCHITECTURE_REVIEW_TAG, COMMENT_GREETING } from "@/services/constants";
import { logger, type Logger } from "@/utils/logger";

export interface ArchitectureReviewOptions {
  maxConcurrency?: number;
  maxFiles?: number;
  reviewStartSha?: string;
}

export interface ArchitectureDocReference {
  name: string;
  excerpt: string;
}

export interface ArchitectureFileResult {
  filename: string;
  violationCount: number;
  score: number;
  violations: ReviewComment[];
  docReferences: ArchitectureDocReference[];
  creditsDeducted: number;
}

interface FileViolations {
  filename: string;
  violations: ReviewComment[];
}

export class ArchitectureReviewGenerator {
  private readonly preprocessor: PRPreprocessor;
  private readonly reviewBot: ClaudeBot;
  private readonly prompts: Prompts;
  private readonly architectureService: ArchitectureService;
  private readonly reviewParser: ReviewParser;
  private readonly commentManager: CommentManager;
  private readonly options: Required<Omit<ArchitectureReviewOptions, 'reviewStartSha'>> & { reviewStartSha?: string };
  private readonly log: Logger;
  private fileResults: ArchitectureFileResult[] = [];

  constructor(
    private readonly context: Context<
      "pull_request.opened" | "pull_request.reopened" | "pull_request.synchronize"
    >,
    options: ArchitectureReviewOptions = {},
    log?: Logger
  ) {
    this.log = log ?? logger;
    this.options = {
      maxConcurrency: options.maxConcurrency ?? 3,
      maxFiles: options.maxFiles ?? 50,
      reviewStartSha: options.reviewStartSha,
    };

    const issueDetails = context.issue();
    this.preprocessor = new PRPreprocessor(context.octokit, issueDetails);
    this.commentManager = new CommentManager(context.octokit, issueDetails);

    const aiOptions = getDefaultAIOptions();
    this.reviewBot = new ClaudeBot(aiOptions.reviewBot, undefined, this.log);
    this.prompts = new Prompts();
    this.architectureService = new ArchitectureService();
    this.reviewParser = new ReviewParser();

    this.log.info("ArchitectureReviewGenerator initialized", {
      prNumber: context.payload.pull_request.number,
      maxConcurrency: this.options.maxConcurrency,
      maxFiles: this.options.maxFiles,
    });
  }

  getFileResults(): ArchitectureFileResult[] {
    return this.fileResults;
  }

  async generate(shortSummary = ""): Promise<void> {
    const pullRequest = this.context.payload.pull_request;
    const pullNumber = pullRequest.number;
    const installationId = String(
      (this.context.payload as any).installation?.id ?? ""
    );
    const repositoryFullName = this.context.payload.repository.full_name;

    this.log.info("Architecture review started", {
      prNumber: pullNumber,
      repositoryFullName,
      hasInstallationId: !!installationId,
    });

    // Step 1: Preprocess — fetch diffs, filter files, process hunks
    const preprocessResult = await this.preprocessor.process(
      pullRequest.base.sha,
      pullRequest.head.sha,
      this.options.reviewStartSha
    );

    if (!preprocessResult.success || preprocessResult.filesAndChanges.length === 0) {
      this.log.info("No files to architecture-review", { prNumber: pullNumber });
      return;
    }

    const { filesAndChanges } = preprocessResult;
    const issueDetails = this.context.issue();

    const reviewCommentManager = new ReviewCommentManager(
      this.context.octokit,
      issueDetails
    );

    const limit = pLimit(this.options.maxConcurrency);
    const allViolations: FileViolations[] = [];
    let filesProcessed = 0;

    const reviewPromises = filesAndChanges
      .slice(0, this.options.maxFiles)
      .map(([filename, _fileContent, fileDiff, patches]) =>
        limit(async () => {
          const violations = await this.reviewFile(
            filename,
            fileDiff,
            patches,
            pullRequest.title,
            pullRequest.body ?? "",
            shortSummary,
            installationId,
            repositoryFullName,
            pullNumber,
            reviewCommentManager
          );
          filesProcessed++;
          if (violations.length > 0) {
            allViolations.push({ filename, violations });
          }
        })
      );

    await Promise.all(reviewPromises);

    this.log.info("Architecture review files processed", {
      prNumber: pullNumber,
      filesProcessed,
      filesWithViolations: allViolations.length,
    });

    // Step 2: Post standalone PR comment summarising all violations
    await this.postSummaryComment(
      pullNumber,
      allViolations,
      repositoryFullName
    );

    // Step 3: Submit buffered inline review comments
    const bufferedCount = reviewCommentManager.getBufferedCommentCount();
    if (bufferedCount > 0) {
      await reviewCommentManager.submitReview(
        pullNumber,
        pullRequest.head.sha,
        `Architecture validation completed. ${bufferedCount} inline comment(s) added.`
      );
      this.log.info("Architecture inline review submitted", {
        prNumber: pullNumber,
        commentCount: bufferedCount,
      });
    }
  }

  private async reviewFile(
    filename: string,
    fileDiff: string,
    patches: Array<[number, number, string]>,
    title: string,
    description: string,
    shortSummary: string,
    installationId: string,
    repositoryFullName: string,
    pullNumber: number,
    reviewCommentManager: ReviewCommentManager
  ): Promise<ReviewComment[]> {
    if (!installationId) {
      this.log.warn("No installationId available, skipping architecture query", { filename });
      return [];
    }

    // Query Pinecone for relevant architecture rules using the file diff as context
    let rules: string;
    let ruleChunks: Awaited<ReturnType<typeof this.architectureService.queryRules>> = [];
    try {
      ruleChunks = await this.architectureService.queryRules(
        installationId,
        repositoryFullName,
        fileDiff || filename
      );

      if (ruleChunks.length === 0) {
        this.log.debug("No architecture rules found for file, skipping", { filename });
        return [];
      }

      rules = ruleChunks
        .map((chunk) => `### ${chunk.name}\n\n${chunk.text}`)
        .join("\n\n---\n\n");

      this.log.debug("Architecture rules retrieved", {
        filename,
        ruleChunksCount: ruleChunks.length,
        rulesLength: rules.length,
      });
    } catch (error: any) {
      this.log.error("Failed to query architecture rules", {
        filename,
        error: error.message,
      });
      return [];
    }

    // Build the prompt with rules injected
    const patchText = patches.map(([s, e, p]) => `${s}-${e}:\n${p}`).join("\n\n");
    const templateData: TemplateData = {
      title,
      description,
      short_summary: shortSummary,
      filename,
      patches: patchText,
      architecture_rules: rules,
    };

    const prompt = this.prompts.renderArchitectureReviewFileDiff(templateData);

    let response: string;
    let fileCredits = 0;
    try {
      const usageBefore = this.reviewBot.getAccumulatedUsage();
      const botResponse = await this.reviewBot.chat(prompt);
      const usageAfter = this.reviewBot.getAccumulatedUsage();
      response = botResponse.text;

      const deltaInput = usageAfter.inputTokens - usageBefore.inputTokens;
      const deltaOutput = usageAfter.outputTokens - usageBefore.outputTokens;
      const costUsd = calculateCostUsd(usageAfter.model, deltaInput, deltaOutput);
      fileCredits = calculateCredits(costUsd);
    } catch (error: any) {
      this.log.error("Claude architecture review call failed", {
        filename,
        pullNumber,
        error: error.message,
      });
      return [];
    }

    // Parse Claude's response
    const violations = this.reviewParser.parse(response, patches);

    this.log.info("Architecture review parsed", {
      filename,
      violations: violations.length,
    });

    // Buffer each violation as an inline PR review comment
    for (const violation of violations) {
      await reviewCommentManager.bufferReviewComment(
        filename,
        violation.startLine,
        violation.endLine,
        `**Architecture Violation**\n\n${violation.comment}`
      );
    }

    // Accumulate file result for platform persistence
    // Score = % of rules that were not violated, clamped to [0, 100]
    const score = ruleChunks.length > 0
      ? Math.max(0, Math.round(100 * (1 - violations.length / ruleChunks.length)))
      : 100;
    const docReferences: ArchitectureDocReference[] = ruleChunks.map((chunk) => ({
      name: chunk.name,
      excerpt: chunk.text.slice(0, 200),
    }));
    this.fileResults.push({ filename, violationCount: violations.length, score, violations, docReferences, creditsDeducted: fileCredits });

    return violations;
  }

  private async postSummaryComment(
    pullNumber: number,
    allViolations: FileViolations[],
    repositoryFullName: string
  ): Promise<void> {
    let body: string;

    if (allViolations.length === 0) {
      body = `${COMMENT_GREETING}

## Architecture Validation

No architecture rule violations found in this PR. ✅

${ARCHITECTURE_REVIEW_TAG}`;
    } else {
      const totalViolations = allViolations.reduce(
        (sum, f) => sum + f.violations.length,
        0
      );

      const violationLines = allViolations
        .map(({ filename, violations }) => {
          const items = violations
            .map((v) => `  - Lines \`${v.startLine}-${v.endLine}\`: ${v.comment.split("\n")[0]}`)
            .join("\n");
          return `### \`${filename}\`\n\n${items}`;
        })
        .join("\n\n");

      body = `${COMMENT_GREETING}

## Architecture Validation

Found **${totalViolations}** architecture rule violation(s) across **${allViolations.length}** file(s). See inline comments for details.

${violationLines}

> Architecture rules are defined in the [ThinkThroo platform](https://thinkthroo.com) for \`${repositoryFullName}\`.

${ARCHITECTURE_REVIEW_TAG}`;
    }

    try {
      await this.commentManager.comment(body, ARCHITECTURE_REVIEW_TAG, "replace");
      this.log.info("Architecture summary comment posted", { pullNumber });
    } catch (error: any) {
      this.log.error("Failed to post architecture summary comment", {
        pullNumber,
        error: error.message,
      });
    }
  }

  /**
   * Returns the accumulated AI token usage for this generator's review bot.
   */
  getAccumulatedUsage(): BotAccumulatedUsage[] {
    return [this.reviewBot.getAccumulatedUsage()];
  }
}
