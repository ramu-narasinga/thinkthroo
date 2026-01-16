import { logger } from "@/utils/logger";

export interface ReviewComment {
  startLine: number;
  endLine: number;
  comment: string;
}
export class ReviewParser {
  
  parse(
    response: string,
    patches: Array<[number, number, string]>,
    debug: boolean = false
  ): ReviewComment[] {
    logger.debug("Parsing review response", {
      responseLength: response?.length || 0,
      patchCount: patches.length,
      debug,
    });

    const reviews: ReviewComment[] = [];

    if (!response) {
      logger.debug("Empty response provided to parser");
      return reviews;
    }

    response = this.sanitizeResponse(response.trim());
    logger.debug("Response sanitized", {
      sanitizedLength: response.length,
    });

    const lines = response.split('\n');
    const lineNumberRangeRegex = /(?:^|\s)(\d+)-(\d+):\s*$/;
    const commentSeparator = '---';

    let currentStartLine: number | null = null;
    let currentEndLine: number | null = null;
    let currentComment = '';

    const storeReview = (): void => {
      if (currentStartLine !== null && currentEndLine !== null) {
        const review: ReviewComment = {
          startLine: currentStartLine,
          endLine: currentEndLine,
          comment: currentComment.trim(),
        };

        let withinPatch = false;
        let bestPatchStartLine = -1;
        let bestPatchEndLine = -1;
        let maxIntersection = 0;

        // Find the best patch that overlaps with this review
        for (const [startLine, endLine] of patches) {
          const intersectionStart = Math.max(review.startLine, startLine);
          const intersectionEnd = Math.min(review.endLine, endLine);
          const intersectionLength = Math.max(
            0,
            intersectionEnd - intersectionStart + 1
          );

          if (intersectionLength > maxIntersection) {
            maxIntersection = intersectionLength;
            bestPatchStartLine = startLine;
            bestPatchEndLine = endLine;
            withinPatch =
              intersectionLength === review.endLine - review.startLine + 1;
          }

          if (withinPatch) break;
        }

        // Map review to patch if outside bounds
        if (!withinPatch) {
          if (bestPatchStartLine !== -1 && bestPatchEndLine !== -1) {
            review.comment = `> Note: This review was outside of the patch, so it was mapped to the patch with the greatest overlap. Original lines [${review.startLine}-${review.endLine}]

${review.comment}`;
            review.startLine = bestPatchStartLine;
            review.endLine = bestPatchEndLine;
          } else {
            review.comment = `> Note: This review was outside of the patch, but no patch was found that overlapped with it. Original lines [${review.startLine}-${review.endLine}]

${review.comment}`;
            review.startLine = patches[0][0];
            review.endLine = patches[0][1];
          }
        }

        reviews.push(review);

        if (debug) {
          logger.debug(`Stored review for lines ${currentStartLine}-${currentEndLine}`, {
            comment: currentComment.trim().substring(0, 100),
          });
        }
      }
    };

    for (const line of lines) {
      const lineNumberRangeMatch = line.match(lineNumberRangeRegex);

      if (lineNumberRangeMatch != null) {
        storeReview();
        currentStartLine = parseInt(lineNumberRangeMatch[1], 10);
        currentEndLine = parseInt(lineNumberRangeMatch[2], 10);
        currentComment = '';
        if (debug) {
          logger.debug(`Found line number range: ${currentStartLine}-${currentEndLine}`);
        }
        continue;
      }

      if (line.trim() === commentSeparator) {
        storeReview();
        currentStartLine = null;
        currentEndLine = null;
        currentComment = '';
        if (debug) {
          logger.debug('Found comment separator');
        }
        continue;
      }

      if (currentStartLine !== null && currentEndLine !== null) {
        currentComment += `${line}\n`;
      }
    }

    storeReview();

    logger.info("Review parsing completed", {
      totalReviews: reviews.length,
      patchCount: patches.length,
      linesProcessed: lines.length,
    });

    return reviews;
  }

  private sanitizeCodeBlock(comment: string, codeBlockLabel: string): string {
    const codeBlockStart = `\`\`\`${codeBlockLabel}`;
    const codeBlockEnd = '```';
    const lineNumberRegex = /^ *(\d+): /gm;

    let codeBlockStartIndex = comment.indexOf(codeBlockStart);

    while (codeBlockStartIndex !== -1) {
      const codeBlockEndIndex = comment.indexOf(
        codeBlockEnd,
        codeBlockStartIndex + codeBlockStart.length
      );

      if (codeBlockEndIndex === -1) break;

      const codeBlock = comment.substring(
        codeBlockStartIndex + codeBlockStart.length,
        codeBlockEndIndex
      );
      const sanitizedBlock = codeBlock.replace(lineNumberRegex, '');

      comment =
        comment.slice(0, codeBlockStartIndex + codeBlockStart.length) +
        sanitizedBlock +
        comment.slice(codeBlockEndIndex);

      codeBlockStartIndex = comment.indexOf(
        codeBlockStart,
        codeBlockStartIndex +
          codeBlockStart.length +
          sanitizedBlock.length +
          codeBlockEnd.length
      );
    }

    return comment;
  }

  private sanitizeResponse(comment: string): string {
    comment = this.sanitizeCodeBlock(comment, 'suggestion');
    comment = this.sanitizeCodeBlock(comment, 'diff');
    return comment;
  }

  isLGTM(comment: string): boolean {
    const lowerComment = comment.toLowerCase();
    const isLgtm = lowerComment.includes('lgtm') || lowerComment.includes('looks good to me');
    
    if (isLgtm) {
      logger.debug("LGTM pattern detected in comment", {
        commentPreview: comment.substring(0, 50),
      });
    }
    
    return isLgtm;
  }
}
