import type { Context } from "probot";
import { addPrSummaryComment } from "./add-pr-summary-comment";
import { findCommentWithTag } from "@/utils/comments/find-comment-with-tag";
import { SUMMARIZE_TAG } from "@/utils/constants";
import { getRawSummary } from "@/utils/comments/get-raw-summary";
import { getShortSummary } from "@/utils/comments/get-short-summary";
import { getReviewedCommitIdsBlock } from "@/utils/commits/get-reviewed-commit-ids-block";
import { getAllCommitIds } from "@/utils/commits/get-all-commit-ids";
import { getHighestReviewedCommitId } from "@/utils/commits/get-highest-reviewed-commit-id";
import { listComments } from "@/utils/comments/list-comments";
import { getReviewedCommitIds } from "@/utils/commits/get-reviewed-commit-ids";

export async function generatePullRequestSummary(context: Context<'pull_request'>) {

	const issueDetails = context.issue();
	const pull_request = context.payload.pull_request;
	const pull_number = pull_request.number;
	const octokit = context.octokit;

	const comments = await listComments(octokit, pull_number, issueDetails)
	const existingSummarizeCmt = await findCommentWithTag(
		SUMMARIZE_TAG,
		comments
	)
	let existingCommitIdsBlock = ''
	let existingSummarizeCmtBody = ''
	let rawSummary = ''
	let shortSummary = ''

	if (existingSummarizeCmt != null) {
		existingSummarizeCmtBody = existingSummarizeCmt.body
		rawSummary = getRawSummary(existingSummarizeCmtBody)
		shortSummary = getShortSummary(existingSummarizeCmtBody)
		existingCommitIdsBlock = getReviewedCommitIdsBlock(existingSummarizeCmtBody)
	}

	
	const allCommitIds = await getAllCommitIds(octokit, pull_number, issueDetails)

	// find highest reviewed commit id
	let highestReviewedCommitId = ''
	if (existingCommitIdsBlock !== '') {
		highestReviewedCommitId = getHighestReviewedCommitId(
			allCommitIds,
			getReviewedCommitIds(existingCommitIdsBlock)
		)
	}

	if (
		highestReviewedCommitId === '' ||
		highestReviewedCommitId === pull_request.head.sha
	) {
		console.info(
		`Will review from the base commit: ${
			pull_request.base.sha as string
		}`
		)
		highestReviewedCommitId = pull_request.base.sha
	} else {
		console.info(`Will review from commit: ${highestReviewedCommitId}`)
	}

	// Fetch the diff between the highest reviewed commit and the latest commit of the PR branch
	const incrementalDiff = await octokit.repos.compareCommits({
		owner: issueDetails.owner,
		repo: issueDetails.repo,
		base: highestReviewedCommitId,
		head: context.payload.pull_request.head.sha
	})

	// Fetch the diff between the target branch's base commit and the latest commit of the PR branch
	const targetBranchDiff = await octokit.repos.compareCommits({
		owner: issueDetails.owner,
		repo: issueDetails.repo,
		base: context.payload.pull_request.base.sha,
		head: context.payload.pull_request.head.sha
	})

	const incrementalFiles = incrementalDiff.data.files
	const targetBranchFiles = targetBranchDiff.data.files

	if (incrementalFiles == null || targetBranchFiles == null) {
		console.warn('Skipped: files data is missing')
		return
	}

	// Filter out any file that is changed compared to the incremental changes
	const files = targetBranchFiles.filter(targetBranchFile =>
		incrementalFiles.some(
		incrementalFile => incrementalFile.filename === targetBranchFile.filename
		)
	)

	if (files.length === 0) {
		console.warn('Skipped: files is null')
		return
	}

	// skip files if they are filtered out
	const filterSelectedFiles = []
	// const filterIgnoredFiles = []
	for (const file of files) {
		// TODO: implement file ignore logic here
		// https://github.com/coderabbitai/ai-pr-reviewer/blob/d5ec3970b3acc4b9d673e6cd601bf4d3cf043b55/src/review.ts#L149
		filterSelectedFiles.push(file)
	}

	if (filterSelectedFiles.length === 0) {
		console.warn('Skipped: filterSelectedFiles is null')
		return
	}

	const commits = incrementalDiff.data.commits

	if (commits.length === 0) {
		console.warn('Skipped: commits is null')
		return
	}

	

	const pr = context.pullRequest();
	const prDetails = {
		owner: pr.owner,
		repo: pr.repo,
		issue_number: pr.pull_number,
	};
	await addPrSummaryComment(context.octokit, prDetails);
}
