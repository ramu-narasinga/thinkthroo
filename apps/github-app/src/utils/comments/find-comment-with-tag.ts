import { IssueDetails } from "@/types/issue"
import { listComments } from "./list-comments"

export async function findCommentWithTag(tag: string, comments: any[]) {
    try {
      
      for (const cmt of comments) {
        if (cmt.body && cmt.body.includes(tag)) {
          return cmt
        }
      }

      return null
    } catch (e: unknown) {
      console.warn(`Failed to find comment with tag: ${e}`)
      return null
    }
  }