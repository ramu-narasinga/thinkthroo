import type { ClaudeBot } from "@/services/ai/ClaudeBot";
import type { Prompts, TemplateData } from "@/services/ai/Prompts";
import { countTokens } from "@/services/ai/TokenCounter";
import { ReviewParser } from "./ReviewParser";
import type { ReviewCommentManager } from "./ReviewCommentManager";
import { COMMENT_REPLY_TAG } from "@/services/constants";
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
    logger.debug("FileReviewer initialized", {
      maxRequestTokens: options.maxRequestTokens,
      reviewCommentLGTM: options.reviewCommentLGTM,
      debug: options.debug,
    });
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
    const startTime = Date.now();
    logger.info("Starting file review", {
      filename,
      pullNumber,
      patchCount: patches.length,
      fileContentLength: _fileContent.length,
    });

    const result: ReviewResult = {
      filename,
      reviewCount: 0,
      lgtmCount: 0,
      failed: false,
    };

    const data: TemplateData = {
      ...templateData,
      filename,
      patches: "",
    };

    logger.debug("Rendering base prompt", { filename, pullNumber });
    const basePrompt = this.prompts.renderReviewFileDiff(data);
    
    // Use Anthropic's accurate token counting for base prompt
    let tokens = await countTokens(basePrompt, this.bot.getModel());
    logger.debug("Base prompt token count", {
      filename,
      pullNumber,
      basePromptTokens: tokens,
      maxAllowedTokens: this.options.maxRequestTokens,
    });

    // Determine how many patches we can pack
    let patchesToPack = 0;
    for (const [, , patch] of patches) {
      const patchTokens = await countTokens(patch, this.bot.getModel());
      if (tokens + patchTokens > this.options.maxRequestTokens) {
        logger.debug("Patch packing limit reached", {
          filename,
          pullNumber,
          patchesToPack,
          totalPatches: patches.length,
          currentTokens: tokens,
          patchTokens,
          maxTokens: this.options.maxRequestTokens,
        });
        break;
      }
      tokens += patchTokens;
      patchesToPack += 1;
    }

    logger.info("Patch packing complete", {
      filename,
      pullNumber,
      patchesToPack,
      totalPatches: patches.length,
      finalTokenCount: tokens,
      utilizationPercent: ((tokens / this.options.maxRequestTokens) * 100).toFixed(1) + '%',
    });

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
        logger.debug("Fetching comment chains for patch", {
          filename,
          pullNumber,
          startLine,
          endLine,
          patchNumber: patchesPacked,
        });

        commentChain = await this.reviewCommentManager.getCommentChainsWithinRange(
          pullNumber,
          filename,
          startLine,
          endLine,
          COMMENT_REPLY_TAG
        );

        if (commentChain) {
          logger.debug("Found comment chains for patch", {
            filename,
            pullNumber,
            startLine,
            endLine,
            chainLength: commentChain.length,
          });
        }
      } catch (e: any) {
        logger.warn("Failed to get comment chains", {
          filename,
          pullNumber,
          startLine,
          endLine,
          error: e.message,
          stack: e.stack,
        });
      }

      // Check if we can pack comment chain
      const commentChainTokens = await countTokens(commentChain, this.bot.getModel());
      logger.debug("Comment chain token count", {
        filename,
        pullNumber,
        commentChainTokens,
        currentTokens: tokens,
        maxTokens: this.options.maxRequestTokens,
        willInclude: tokens + commentChainTokens <= this.options.maxRequestTokens,
      });

      // TODO: Research maxRequestTokens improvement
      if (tokens + commentChainTokens > this.options.maxRequestTokens) {
        logger.warn("Comment chain exceeds token limit, excluding", {
          filename,
          pullNumber,
          commentChainTokens,
          currentTokens: tokens,
          maxTokens: this.options.maxRequestTokens,
        });
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
        logger.info("Sending file review request to AI", {
          filename,
          pullNumber,
          patchesPacked,
          totalTokens: tokens,
        });

        const response = await this.bot.chat(this.prompts.renderReviewFileDiff(data));

        logger.debug("AI review response received", {
          filename,
          pullNumber,
          responseLength: response.text.length,
          hasContent: response.text !== "",
        });

        if (response.text === "") {
          logger.warn("Empty response from AI for file review", {
            filename,
            pullNumber,
            patchesPacked,
            tokens,
          });
          result.failed = true;
          result.reason = "no response";
          this.reviewsFailed.push(`${filename} (no response)`);
          return result;
        }

        // Parse review comments
        logger.debug("Parsing AI review comments", {
          filename,
          pullNumber,
          responseLength: response.text.length,
        });

        const reviews = this.reviewParser.parse(response.text, patches, this.options.debug);

        logger.info("AI review comments parsed", {
          filename,
          pullNumber,
          reviewsFound: reviews.length,
        });

        for (const review of reviews) {
          // Check for LGTM
          if (!this.options.reviewCommentLGTM && this.reviewParser.isLGTM(review.comment)) {
            logger.debug("LGTM comment detected, skipping", {
              filename,
              pullNumber,
              lineRange: `${review.startLine}-${review.endLine}`,
            });
            result.lgtmCount += 1;
            continue;
          }

          try {
            logger.debug("Buffering review comment", {
              filename,
              pullNumber,
              startLine: review.startLine,
              endLine: review.endLine,
              commentLength: review.comment.length,
            });

            result.reviewCount += 1;
            this.reviewCommentManager.bufferReviewComment(
              filename,
              review.startLine,
              review.endLine,
              review.comment
            );

            logger.debug("Review comment buffered successfully", {
              filename,
              pullNumber,
              totalReviewsForFile: result.reviewCount,
            });
          } catch (e: any) {
            logger.error("Failed to buffer review comment", {
              filename,
              pullNumber,
              error: e.message,
              startLine: review.startLine,
              endLine: review.endLine,
            });
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

    const duration = Date.now() - startTime;
    logger.info("File review completed", {
      filename,
      pullNumber,
      durationMs: duration,
      reviewCount: result.reviewCount,
      lgtmCount: result.lgtmCount,
      failed: result.failed,
      reason: result.reason,
    });

    return result;
  }
}
