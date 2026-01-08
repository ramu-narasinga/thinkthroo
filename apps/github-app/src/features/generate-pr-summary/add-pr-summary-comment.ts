import { IssueDetails } from "@/types/issue";
import { ProbotOctokit } from "probot";

const prSummaryBodyText =
	"Thank you for opening this pull request!\n\nHere is a summary of your PR (placeholder):\n\n- Please add a description and context for reviewers.";

export function addPrSummaryComment(
    octokit: InstanceType<typeof ProbotOctokit>,
    prDetails: IssueDetails
) {
    return octokit.issues.createComment({
        ...prDetails,
        body: prSummaryBodyText,
    });
}