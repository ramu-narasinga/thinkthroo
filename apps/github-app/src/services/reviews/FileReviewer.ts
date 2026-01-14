import type { ClaudeBot } from "@/services/ai/ClaudeBot";
import type { Prompts, TemplateData } from "@/services/ai/Prompts";
import { estimateTokens } from "@/services/ai/TokenCounter";
import { ReviewParser } from "./ReviewParser";
import type { ReviewCommentManager } from "./ReviewCommentManager";
import { COMMENT_REPLY_TAG } from "@/services/constants-review";
import { logger } from "@/utils/logger";

export interface ReviewOptions {
  maxRequestTokens: number;
  reviewCommentLGTM: boolean;
  debug: boolean;
}

export interface ReviewResult {
  filename: string;
  reviewCount: number;
  lgtmCount: number;
  failed: boolean;
  reason?: string;
}

/**
 * Handles AI-based file review for PR reviews
 */
export class FileReviewer {
  private reviewsFailed: string[] = [];
  private readonly reviewParser: ReviewParser;

  constructor(
    private readonly bot: ClaudeBot,
    private readonly prompts: Prompts,
    private readonly reviewCommentManager: ReviewCommentManager,
    private readonly options: ReviewOptions
  ) {
    this.reviewParser = new ReviewParser();
  }

  getReviewsFailed(): string[] {
    return this.reviewsFailed;
  }

  /**
   * Review a single file's patches using AI
   */
  async reviewFile(
    filename: string,
    _fileContent: string,
    patches: Array<[number, number, string]>,
    templateData: TemplateData,
    pullNumber: number
  ): Promise<ReviewResult> {
    logger.debug("Reviewing file", { filename, patchCount: patches.length });

    const result: ReviewResult = {
      filename,
      reviewCount: 0,
      lgtmCount: 0,
      failed: false,
    };

    // Prepare template data with file-specific information
    const data: TemplateData = {
      ...templateData,
      filename,
      patches: "",
    };

    // Calculate base tokens
    let basePrompt = this.prompts.renderReviewFileDiff(data);
    let tokens = estimateTokens(basePrompt);

    // Determine how many patches we can pack
    let patchesToPack = 0;
    for (const [, , patch] of patches) {
      const patchTokens = estimateTokens(patch);
      if (tokens + patchTokens > this.options.maxRequestTokens) {
        logger.debug("Patch packing limit reached", {
          filename,
          patchesToPack,
          totalPatches: patches.length,
          tokens,
          maxTokens: this.options.maxRequestTokens,
        });
        break;
      }
      tokens += patchTokens;
      patchesToPack += 1;
    }

    if (patchesToPack === 0) {
      result.failed = true;
      result.reason = "diff too large";
      this.reviewsFailed.push(`${filename} (diff too large)`);
      return result;
    }

    // Pack patches with comment chains
    let patchesPacked = 0;
    for (const [startLine, endLine, patch] of patches) {
      if (patchesPacked >= patchesToPack) {
        logger.debug("Unable to pack more patches", {
          filename,
          packed: patchesPacked,
          total: patches.length,
        });
        break;
      }
      patchesPacked += 1;

      // Get existing comment chains for this range
      let commentChain = "";
      try {
        commentChain = await this.reviewCommentManager.getCommentChainsWithinRange(
          pullNumber,
          filename,
          startLine,
          endLine,
          COMMENT_REPLY_TAG
        );

        if (commentChain) {
          logger.debug("Found comment chains for file", {
            filename,
            startLine,
            endLine,
          });
        }
      } catch (e: any) {
        logger.warn("Failed to get comments", {
          filename,
          error: e.message,
          stack: e.stack,
        });
      }

      // Check if we can pack comment chain
      const commentChainTokens = estimateTokens(commentChain);
      if (tokens + commentChainTokens > this.options.maxRequestTokens) {
        commentChain = "";
      } else {
        tokens += commentChainTokens;
      }

      // Add patch to data
      data.patches += `\n${patch}\n`;

      if (commentChain) {
        data.patches += `\n---comment_chains---\n\`\`\`\n${commentChain}\n\`\`\`\n`;
      }

      data.patches += "\n---end_change_section---\n";
    }

    // Perform review if we packed any patches
    if (patchesPacked > 0) {
      try {
        const response = await this.bot.chat(this.prompts.renderReviewFileDiff(data));

        if (response.text === "") {
          logger.warn("Nothing obtained from AI for review", { filename });
          result.failed = true;
          result.reason = "no response";
          this.reviewsFailed.push(`${filename} (no response)`);
          return result;
        }

        // Parse review comments
        const reviews = this.reviewParser.parse(response.text, patches, this.options.debug);

        for (const review of reviews) {
          // Check for LGTM
          if (!this.options.reviewCommentLGTM && this.reviewParser.isLGTM(review.comment)) {
            result.lgtmCount += 1;
            continue;
          }

          try {
            result.reviewCount += 1;
            this.reviewCommentManager.bufferReviewComment(
              filename,
              review.startLine,
              review.endLine,
              review.comment
            );
          } catch (e: any) {
            this.reviewsFailed.push(`${filename} comment failed (${e as string})`);
          }
        }
      } catch (e: any) {
        logger.warn("Failed to review file", {
          filename,
          error: e.message,
          stack: e.stack,
        });
        result.failed = true;
        result.reason = e.message;
        this.reviewsFailed.push(`${filename} (${e as string})`);
      }
    }

    return result;
  }
}
