import { COMMIT_ID_END_TAG, COMMIT_ID_START_TAG } from "../constants"

// get review commit ids comment block from the body as a string
// including markers
export function getReviewedCommitIdsBlock(commentBody: string): string {
    const start = commentBody.indexOf(COMMIT_ID_START_TAG)
    const end = commentBody.indexOf(COMMIT_ID_END_TAG)
    if (start === -1 || end === -1) {
      return ''
    }
    return commentBody.substring(start, end + COMMIT_ID_END_TAG.length)
}