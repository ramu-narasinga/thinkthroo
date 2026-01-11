import type { Context } from "probot";
import type { IssueDetails } from "@/types/issue";

export interface SummaryResult {
  filename: string;
  summary: string;
  needsReview: boolean;
}

export interface SummaryOptions {
  reviewSimpleChanges: boolean;
  lightTokenLimits: {
    requestTokens: number;
  };
}

/**
 * Handles AI-based file summarization for PR reviews
 */
export class FileSummarizer {
  private summariesFailed: string[] = [];

  constructor(
    private readonly octokit: Context["octokit"],
    private readonly issueDetails: IssueDetails,
    private readonly options: SummaryOptions
  ) {}

  getSummariesFailed(): string[] {
    return this.summariesFailed;
  }

  async summarizeFile(
    filename: string,
    fileContent: string,
    fileDiff: string,
    lightBot: any,
    prompts: any,
    inputs: any,
    getTokenCount: (text: string) => number
  ): Promise<SummaryResult | null> {
    console.info(`summarize: ${filename}`);
    const ins = inputs.clone();
    
    if (fileDiff.length === 0) {
      console.warn(`summarize: file_diff is empty, skip ${filename}`);
      this.summariesFailed.push(`${filename} (empty diff)`);
      return null;
    }

    ins.filename = filename;
    ins.fileDiff = fileDiff;

    // render prompt based on inputs so far
    const summarizePrompt = prompts.renderSummarizeFileDiff(
      ins,
      this.options.reviewSimpleChanges
    );
    const tokens = getTokenCount(summarizePrompt);

    if (tokens > this.options.lightTokenLimits.requestTokens) {
      console.info(`summarize: diff tokens exceeds limit, skip ${filename}`);
      this.summariesFailed.push(`${filename} (diff tokens exceeds limit)`);
      return null;
    }

    // summarize content
    try {
      const [summarizeResp] = await lightBot.chat(summarizePrompt, {});

      if (summarizeResp === "") {
        console.info("summarize: nothing obtained from openai");
        this.summariesFailed.push(`${filename} (nothing obtained from openai)`);
        return null;
      } else {
        if (this.options.reviewSimpleChanges === false) {
          // parse the comment to look for triage classification
          // Format is : [TRIAGE]: <NEEDS_REVIEW or APPROVED>
          // if the change needs review return true, else false
          const triageRegex = /\[TRIAGE\]:\s*(NEEDS_REVIEW|APPROVED)/;
          const triageMatch = summarizeResp.match(triageRegex);

          if (triageMatch != null) {
            const triage = triageMatch[1];
            const needsReview = triage === "NEEDS_REVIEW";

            // remove this line from the comment
            const summary = summarizeResp.replace(triageRegex, "").trim();
            console.info(`filename: ${filename}, triage: ${triage}`);
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
      }
    } catch (e: any) {
      console.warn(`summarize: error from openai: ${e as string}`);
      this.summariesFailed.push(
        `${filename} (error from openai: ${e as string})})`
      );
      return null;
    }
  }

  async summarizeFiles(
    filesAndChanges: Array<[string, string, string, Array<[number, number, string]>]>,
    lightBot: any,
    prompts: any,
    inputs: any,
    getTokenCount: (text: string) => number
  ): Promise<SummaryResult[]> {
    const summaries: SummaryResult[] = [];

    for (const [filename, fileContent, fileDiff] of filesAndChanges) {
      const result = await this.summarizeFile(
        filename,
        fileContent,
        fileDiff,
        lightBot,
        prompts,
        inputs,
        getTokenCount
      );

      if (result) {
        summaries.push(result);
      }
    }

    return summaries;
  }
}
