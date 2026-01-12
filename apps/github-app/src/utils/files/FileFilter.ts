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
    return targetBranchFiles.filter((targetBranchFile) =>
      incrementalFiles.some(
        (incrementalFile) =>
          incrementalFile.filename === targetBranchFile.filename
      )
    );
  }

  applyFileIgnoreRules(files: any[]): FilterResult {
    // TODO: Implement file ignore logic here
    // https://github.com/coderabbitai/ai-pr-reviewer/blob/d5ec3970b3acc4b9d673e6cd601bf4d3cf043b55/src/review.ts#L149
    
    const filterSelectedFiles = [];
    const filterIgnoredFiles = [];
    
    for (const file of files) {
      // For now, select all files. Add ignore logic here later.
      filterSelectedFiles.push(file);
    }
    
    return {
      selected: filterSelectedFiles,
      ignored: filterIgnoredFiles,
    };
  }

  validateFiles(files: any[], context: string): boolean {
    if (!files || files.length === 0) {
      console.warn(`Skipped: ${context}`);
      return false;
    }
    return true;
  }
}
