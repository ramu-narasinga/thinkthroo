import { COMMIT_ID_END_TAG, COMMIT_ID_START_TAG } from "@/utils/constants"

// function that takes a comment body and returns the list of commit ids that have been reviewed
// commit ids are comments between the commit_ids_reviewed_start and commit_ids_reviewed_end markers
// <!-- [commit_id] -->
export function getReviewedCommitIds(commentBody: string): string[] {

    const start = commentBody.indexOf(COMMIT_ID_START_TAG)
    const end = commentBody.indexOf(COMMIT_ID_END_TAG)

    if (start === -1 || end === -1) {
      return []
    }

    const ids = commentBody.substring(start + COMMIT_ID_START_TAG.length, end)
    
    // remove the <!-- and --> markers from each id and extract the id and remove empty strings
    return ids
      .split('<!--')
      .map(id => id.replace('-->', '').trim())
      .filter(id => id !== '')
}