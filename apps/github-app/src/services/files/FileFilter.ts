import { logger } from "@/utils/logger";

export interface FilterResult {
  selected: any[];
  ignored: any[];
}

/**
 * Filters and selects files for review
 */
export class FileFilter {
  filterChangedFiles(
    targetBranchFiles: any[],
    incrementalFiles: any[]
  ): any[] {
    logger.debug("Filtering changed files", {
      targetBranchFilesCount: targetBranchFiles.length,
      incrementalFilesCount: incrementalFiles.length,
    });

    const result = targetBranchFiles.filter((targetBranchFile) =>
      incrementalFiles.some(
        (incrementalFile) =>
          incrementalFile.filename === targetBranchFile.filename
      )
    );

    logger.info("Changed files filtered", {
      inputTargetFiles: targetBranchFiles.length,
      inputIncrementalFiles: incrementalFiles.length,
      outputChangedFiles: result.length,
      matchPercentage: ((result.length / targetBranchFiles.length) * 100).toFixed(1) + '%',
    });

    return result;
  }

  applyFileIgnoreRules(files: any[]): FilterResult {
    logger.debug("Applying file ignore rules", {
      inputFilesCount: files.length,
    });

    // TODO: Implement file ignore logic here
    // https://github.com/coderabbitai/ai-pr-reviewer/blob/d5ec3970b3acc4b9d673e6cd601bf4d3cf043b55/src/review.ts#L149
    
    const filterSelectedFiles: any[] = [];
    const filterIgnoredFiles: any[] = [];
    
    for (const file of files) {
      // For now, select all files. Add ignore logic here later.
      filterSelectedFiles.push(file);
    }

    logger.info("File ignore rules applied", {
      inputFiles: files.length,
      selectedFiles: filterSelectedFiles.length,
      ignoredFiles: filterIgnoredFiles.length,
    });
    
    return {
      selected: filterSelectedFiles,
      ignored: filterIgnoredFiles,
    };
  }

  validateFiles(files: any[], context: string): boolean {
    logger.debug("Validating files", {
      context,
      hasFiles: !!files,
      fileCount: files?.length ?? 0,
    });

    if (!files || files.length === 0) {
      logger.warn("File validation failed", {
        context,
        fileCount: files?.length ?? 0,
        reason: !files ? 'files is null/undefined' : 'files array is empty',
      });
      return false;
    }

    logger.debug("File validation passed", {
      context,
      fileCount: files.length,
    });

    return true;
  }
}
