import type { SummaryResult } from "@/services/summarization/FileSummarizer";
import { logger } from "@/utils/logger";

export type FileAndChanges = [string, string, string, Array<[number, number, string]>];

export interface FilteredReviewFiles {
  filesToReview: FileAndChanges[];
  reviewsSkipped: string[];
}

export class FileReviewFilter {
  
  filter(
    filesAndChanges: FileAndChanges[],
    summaries: SummaryResult[]
  ): FilteredReviewFiles {
    logger.debug("Filtering files for review", {
      totalFiles: filesAndChanges.length,
      summariesCount: summaries.length,
    });

    const filesToReview = filesAndChanges.filter(([filename]) => {
      const summary = summaries.find(
        (s) => s.filename === filename
      );
      
      const needsReview = summary?.needsReview ?? true;
      
      logger.debug("File review decision", {
        filename,
        needsReview,
        hasSummary: !!summary,
      });
      
      return needsReview;
    });

    // Collect files that were skipped
    const reviewsSkipped = filesAndChanges
      .filter(([filename]) =>
        !filesToReview.some(([reviewFilename]) => reviewFilename === filename)
      )
      .map(([filename]) => filename);

    logger.info("File review filtering complete", {
      totalFiles: filesAndChanges.length,
      filesToReview: filesToReview.length,
      reviewsSkipped: reviewsSkipped.length,
    });

    return {
      filesToReview,
      reviewsSkipped,
    };
  }

  /**
   * No filtering - return all files for review
   * Used when summaries are disabled or not available
   */
  noFilter(filesAndChanges: FileAndChanges[]): FilteredReviewFiles {
    logger.debug("No filtering applied, reviewing all files", {
      totalFiles: filesAndChanges.length,
    });

    return {
      filesToReview: filesAndChanges,
      reviewsSkipped: [],
    };
  }
}
