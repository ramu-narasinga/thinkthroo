/**
 * Represents a parsed review comment
 */
export interface ReviewComment {
  startLine: number;
  endLine: number;
  comment: string;
}

/**
 * Parse review response from AI into structured review comments
 */
export class ReviewParser {
  /**
   * Parse review response text into ReviewComment objects
   * 
   * Expected format:
   * ```
   * startLine-endLine:
   * comment text
   * ---
   * ```
   */
  parse(
    response: string,
    patches: Array<[number, number, string]>,
    debug: boolean = false
  ): ReviewComment[] {
    const reviews: ReviewComment[] = [];

    if (!response) {
      return reviews;
    }

    // Split by separator (---)
    const sections = response.split('---');

    for (const section of sections) {
      const trimmed = section.trim();
      if (!trimmed) continue;

      // Match pattern: startLine-endLine: or startLine:
      const lineRangeMatch = trimmed.match(/^(\d+)(?:-(\d+))?:\s*/);
      
      if (!lineRangeMatch) {
        if (debug) {
          console.warn(`Failed to parse review section: ${trimmed.substring(0, 100)}`);
        }
        continue;
      }

      const startLine = parseInt(lineRangeMatch[1], 10);
      const endLine = lineRangeMatch[2] ? parseInt(lineRangeMatch[2], 10) : startLine;

      // Extract comment (everything after the line range)
      const comment = trimmed.substring(lineRangeMatch[0].length).trim();

      if (!comment) {
        if (debug) {
          console.warn(`Empty comment for lines ${startLine}-${endLine}`);
        }
        continue;
      }

      // Validate line range is within patches
      const isValidRange = this.validateLineRange(startLine, endLine, patches);
      if (!isValidRange) {
        if (debug) {
          console.warn(
            `Invalid line range ${startLine}-${endLine}, not within any patch. Skipping.`
          );
        }
        continue;
      }

      reviews.push({
        startLine,
        endLine,
        comment,
      });
    }

    return reviews;
  }

  /**
   * Validate that the line range is within the provided patches
   */
  private validateLineRange(
    startLine: number,
    endLine: number,
    patches: Array<[number, number, string]>
  ): boolean {
    for (const [patchStart, patchEnd] of patches) {
      if (startLine >= patchStart && endLine <= patchEnd) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if a comment is an LGTM comment
   */
  isLGTM(comment: string): boolean {
    const lowerComment = comment.toLowerCase();
    return lowerComment.includes('lgtm') || lowerComment.includes('looks good to me');
  }
}
