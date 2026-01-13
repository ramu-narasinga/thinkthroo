import type { Context } from "probot";
import type { IssueDetails } from "@/types/issue";
import pLimit from "p-limit";
import { logger } from "@/lib/logger";

// Helper types
export type FileWithHunks = [
  string,
  string,
  string,
  Array<[number, number, string]>
] | null;

interface PatchLines {
  oldHunk: { startLine: number; endLine: number };
  newHunk: { startLine: number; endLine: number };
}

interface ParsedHunk {
  oldHunk: string;
  newHunk: string;
}

/**
 * Processes files and extracts hunks for review
 */
export class HunkProcessor {
  private readonly concurrencyLimit = pLimit(5);

  constructor(
    private readonly octokit: Context["octokit"],
    private readonly issueDetails: IssueDetails
  ) {}

  private splitPatch(patch: string | null | undefined): string[] {
    if (!patch) {
      return [];
    }

    const pattern = /(^@@ -(\d+),(\d+) \+(\d+),(\d+) @@).*$/gm;
    const result: string[] = [];
    let last = -1;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(patch)) !== null) {
      if (last === -1) {
        last = match.index;
      } else {
        result.push(patch.substring(last, match.index));
        last = match.index;
      }
    }
    if (last !== -1) {
      result.push(patch.substring(last));
    }
    return result;
  }

  private patchStartEndLine(patch: string): PatchLines | null {
    const pattern = /@@ -(\d+),(\d+) \+(\d+),(\d+) @@/;
    const match = patch.match(pattern);
    if (!match) {
      return null;
    }

    const oldBegin = parseInt(match[1]);
    const oldDiff = parseInt(match[2]);
    const newBegin = parseInt(match[3]);
    const newDiff = parseInt(match[4]);

    return {
      oldHunk: {
        startLine: oldBegin,
        endLine: oldBegin + oldDiff - 1,
      },
      newHunk: {
        startLine: newBegin,
        endLine: newBegin + newDiff - 1,
      },
    };
  }

  private parsePatch(patch: string): ParsedHunk | null {
    const hunkLines = patch.split("\n").slice(1); // Skip the @@ line
    const oldHunkLines: string[] = [];
    const newHunkLines: string[] = [];

    for (const line of hunkLines) {
      if (line.startsWith("-")) {
        oldHunkLines.push(line.substring(1));
      } else if (line.startsWith("+")) {
        newHunkLines.push(line.substring(1));
      } else {
        // Context line
        oldHunkLines.push(line.substring(1));
        newHunkLines.push(line.substring(1));
      }
    }

    return {
      oldHunk: oldHunkLines.join("\n"),
      newHunk: newHunkLines.join("\n"),
    };
  }

  async processFilesIntoHunks(
    files: any[],
    baseSha: string
  ): Promise<FileWithHunks[]> {
    const filteredFiles = await Promise.all(
      files.map((file) =>
        this.concurrencyLimit(async () => {
          // Retrieve file contents
          let fileContent = "";
          try {
            const contents = await this.octokit.repos.getContent({
              owner: this.issueDetails.owner,
              repo: this.issueDetails.repo,
              path: file.filename,
              ref: baseSha,
            });

            if (contents.data != null) {
              if (!Array.isArray(contents.data)) {
                if (
                  contents.data.type === "file" &&
                  contents.data.content != null
                ) {
                  fileContent = Buffer.from(
                    contents.data.content,
                    "base64"
                  ).toString();
                }
              }
            }
          } catch (e: any) {
            logger.debug("Failed to get file contents", {
              filename: file.filename,
              error: e.message,
              note: "This is OK if it's a new file",
            });
          }

          let fileDiff = "";
          if (file.patch != null) {
            fileDiff = file.patch;
          }

          const patches: Array<[number, number, string]> = [];
          for (const patch of this.splitPatch(file.patch)) {
            const patchLines = this.patchStartEndLine(patch);
            if (patchLines == null) {
              continue;
            }
            const hunks = this.parsePatch(patch);
            if (hunks == null) {
              continue;
            }
            const hunksStr = `
---new_hunk---
\`\`\`
${hunks.newHunk}
\`\`\`

---old_hunk---
\`\`\`
${hunks.oldHunk}
\`\`\`
`;
            patches.push([
              patchLines.newHunk.startLine,
              patchLines.newHunk.endLine,
              hunksStr,
            ]);
          }

          if (patches.length > 0) {
            return [file.filename, fileContent, fileDiff, patches] as [
              string,
              string,
              string,
              Array<[number, number, string]>
            ];
          } else {
            return null;
          }
        })
      )
    );

    return filteredFiles;
  }
}
