import { IssueDetails } from "@/types/issue"
import { ProbotOctokit } from "probot"

export const issueCommentsCache: Record<number, any[]> = {}

export async function listComments(octokit: InstanceType<typeof ProbotOctokit>, issue_number: number, issueDetails: IssueDetails) {
    if (issueCommentsCache[issue_number]) {
      return issueCommentsCache[issue_number]
    }

    const allComments: any[] = []
    let page = 1
    try {
      for (;;) {
        const {data: comments} = await octokit.issues.listComments({
          owner: issueDetails.owner,
          repo: issueDetails.repo,
          // eslint-disable-next-line camelcase
          issue_number,
          page,
          // eslint-disable-next-line camelcase
          per_page: 100
        })
        allComments.push(...comments)
        page++
        if (!comments || comments.length < 100) {
          break
        }
      }

      issueCommentsCache[issue_number] = allComments
      return allComments
    } catch (e: any) {
      console.warn(`Failed to list comments: ${e}`)
      return allComments
    }
  }