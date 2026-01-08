// given a list of commit ids provide the highest commit id that has been reviewed
export function getHighestReviewedCommitId(
  commitIds: string[],
  reviewedCommitIds: string[]
): string {
  for (let i = commitIds.length - 1; i >= 0; i--) {
    if (reviewedCommitIds.includes(commitIds[i])) {
      return commitIds[i]
    }
  }
  return ''
}