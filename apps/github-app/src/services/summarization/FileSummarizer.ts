import type { ClaudeBot } from "@/services/ai/ClaudeBot";
import type { Prompts } from "@/services/ai/Prompts";
import type { TemplateData } from "@/services/ai/Prompts";
import { estimateTokens } from "@/services/ai/TokenCounter";
import { logger } from "@/lib/logger";

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
    logger.debug("Summarizing file", { filename });
    
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

    // Render prompt based on data
    const summarizePrompt = this.prompts.renderSummarizeFileDiff(
      data,
      this.options.reviewSimpleChanges
    );
    
    const tokens = estimateTokens(summarizePrompt);

    if (tokens > this.options.maxRequestTokens) {
      logger.info("Diff tokens exceeds limit, skipping file", {
        filename,
        tokens,
        maxTokens: this.options.maxRequestTokens,
      });
      this.summariesFailed.push(`${filename} (diff tokens exceeds limit)`);
      return null;
    }

    // Summarize content using Claude
    try {
      const response = await this.bot.chat(summarizePrompt);
      const summarizeResp = response.text;

      if (summarizeResp === "") {
        logger.warn("Nothing obtained from AI for summarization", { filename });
        this.summariesFailed.push(`${filename} (nothing obtained from AI)`);
        return null;
      }

      if (this.options.reviewSimpleChanges === false) {
        // Parse the comment to look for triage classification
        // Format is: [TRIAGE]: <NEEDS_REVIEW or APPROVED>
        const triageRegex = /\[TRIAGE\]:\s*(NEEDS_REVIEW|APPROVED)/;
        const triageMatch = summarizeResp.match(triageRegex);

        if (triageMatch != null) {
          const triage = triageMatch[1];
          const needsReview = triage === "NEEDS_REVIEW";

          // Remove triage line from the comment
          const summary = summarizeResp.replace(triageRegex, "").trim();
          logger.debug("File triage classification", { filename, triage, needsReview });
          return {
            filename,
            summary,
            needsReview,
          };
        }
      }

      return {
        filename,
        summary: summarizeResp,
        needsReview: true,
      };
    } catch (e: any) {
      logger.warn("Error from AI during summarization", {
        filename,
        error: e.message,
      });
      this.summariesFailed.push(
        `${filename} (error from AI: ${e as string})})`
      );
      return null;
    }
  }
}
