import type { ClaudeBot } from "@/services/ai/ClaudeBot";
import type { Prompts } from "@/services/ai/Prompts";
import type { TemplateData } from "@/services/ai/Prompts";
import { estimateTokens } from "@/services/ai/TokenCounter";
import { logger } from "@/utils/logger";

export interface SummaryResult {
  filename: string;
  summary: string;
  needsReview: boolean;
}

export interface SummaryOptions {
  reviewSimpleChanges: boolean;
  maxRequestTokens: number;
}

/**
 * Handles AI-based file summarization for PR reviews
 */
export class FileSummarizer {
  private summariesFailed: string[] = [];

  constructor(
    private readonly bot: ClaudeBot,
    private readonly prompts: Prompts,
    private readonly options: SummaryOptions
  ) {}

  getSummariesFailed(): string[] {
    return this.summariesFailed;
  }

  /**
   * Summarize a single file's changes using AI
   */
  async summarizeFile(
    filename: string,
    _fileContent: string,
    fileDiff: string,
    templateData: TemplateData
  ): Promise<SummaryResult | null> {
    logger.info("Starting file summarization", { 
      filename,
      fileContentLength: _fileContent.length,
      fileDiffLength: fileDiff.length,
    });
    
    if (fileDiff.length === 0) {
      logger.warn("File diff is empty, skipping summarization", { filename });
      this.summariesFailed.push(`${filename} (empty diff)`);
      return null;
    }

    // Prepare template data with file-specific information
    const data: TemplateData = {
      ...templateData,
      filename,
      fileDiff,
      file_diff: fileDiff,
    };

    logger.debug("Template data prepared for file", {
      filename,
      hasTitle: !!templateData.title,
      hasDescription: !!templateData.description,
    });

    // Render prompt based on data
    const summarizePrompt = this.prompts.renderSummarizeFileDiff(
      data,
      this.options.reviewSimpleChanges
    );
    
    const tokens = estimateTokens(summarizePrompt);

    logger.debug("Token estimation completed", {
      filename,
      tokens,
      maxTokens: this.options.maxRequestTokens,
      withinLimit: tokens <= this.options.maxRequestTokens,
      promptLength: summarizePrompt.length,
    });

    if (tokens > this.options.maxRequestTokens) {
      logger.warn("Diff tokens exceeds limit, skipping file", {
        filename,
        tokens,
        maxTokens: this.options.maxRequestTokens,
        exceedBy: tokens - this.options.maxRequestTokens,
      });
      this.summariesFailed.push(`${filename} (diff tokens exceeds limit)`);
      return null;
    }

    // Summarize content using Claude
    logger.debug("Sending summarization request to AI", {
      filename,
      promptTokens: tokens,
      reviewSimpleChanges: this.options.reviewSimpleChanges,
    });

    try {
      const startTime = Date.now();
      const response = await this.bot.chat(summarizePrompt);
      const duration = Date.now() - startTime;
      const summarizeResp = response.text;

      logger.info("AI summarization response received", {
        filename,
        responseLength: summarizeResp.length,
        hasResponse: summarizeResp.length > 0,
        durationMs: duration,
      });

      if (summarizeResp === "") {
        logger.warn("Nothing obtained from AI for summarization", { filename });
        this.summariesFailed.push(`${filename} (nothing obtained from AI)`);
        return null;
      }

      if (this.options.reviewSimpleChanges === false) {
        logger.debug("Checking for triage classification", { filename });
        
        // Parse the comment to look for triage classification
        // Format is: [TRIAGE]: <NEEDS_REVIEW or APPROVED>
        const triageRegex = /\[TRIAGE\]:\s*(NEEDS_REVIEW|APPROVED)/;
        const triageMatch = summarizeResp.match(triageRegex);

        if (triageMatch != null) {
          const triage = triageMatch[1];
          const needsReview = triage === "NEEDS_REVIEW";

          // Remove triage line from the comment
          const summary = summarizeResp.replace(triageRegex, "").trim();
          logger.info("File triage classification found", { 
            filename, 
            triage, 
            needsReview,
            summaryLength: summary.length,
          });
          return {
            filename,
            summary,
            needsReview,
          };
        } else {
          logger.debug("No triage classification found in response", { filename });
        }
      }

      logger.info("File summarization completed successfully", {
        filename,
        summaryLength: summarizeResp.length,
        needsReview: true,
      });

      return {
        filename,
        summary: summarizeResp,
        needsReview: true,
      };
    } catch (e: any) {
      logger.error("Error from AI during summarization", {
        filename,
        error: e.message,
        stack: e.stack,
      });
      this.summariesFailed.push(
        `${filename} (error from AI: ${e as string})})`
      );
      return null;
    }
  }
}
