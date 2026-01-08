import { IssueDetails } from "@/types/issue";
import { ProbotOctokit } from "probot";

export async function getAllCommitIds(
    octokit: InstanceType<typeof ProbotOctokit>, 
    pull_number: number, 
    issueDetails: IssueDetails): Promise<string[]> {
   
    const allCommits = []
    let page = 1
    let commits;

    do {
        commits = await octokit.pulls.listCommits({
            owner: issueDetails.owner,
            repo: issueDetails.repo,
            // eslint-disable-next-line camelcase
            pull_number,
            // eslint-disable-next-line camelcase
            per_page: 100,
            page
        })

        allCommits.push(...commits.data.map(commit => commit.sha))
        page++
    } while (commits.data.length > 0)

    return allCommits
  }