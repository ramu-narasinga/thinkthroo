/**
 * Slack Channel Notification Service (server-side).
 *
 * Sends PR review and architecture violation reports
 * to the user's configured Slack channel using their OAuth bot token.
 */

import { eq, and } from 'drizzle-orm';
import { slackIntegrations, organizations } from '@/database/schemas';
import { ThinkThrooDatabase } from '@/database/type';

interface SlackBlock {
  type: string;
  text?: { type: string; text: string; emoji?: boolean };
  fields?: { type: string; text: string }[];
  elements?: { type: string; text: string }[];
}

async function postSlackMessage(
  token: string,
  channelId: string,
  text: string,
  blocks: SlackBlock[],
  webhookUrl?: string,
): Promise<boolean> {
  try {
    // Prefer webhook URL (works for private channels without bot membership)
    if (webhookUrl) {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, blocks }),
      });

      if (!response.ok) {
        console.error('[SlackChannel] Webhook failed:', response.status, await response.text());
        return false;
      }
      return true;
    }

    // Fallback to chat.postMessage (requires bot in channel)
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ channel: channelId, text, blocks }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('[SlackChannel] Failed to post message:', data.error);
      return false;
    }

    return true;
  } catch (err: any) {
    console.error('[SlackChannel] Error posting message:', err.message);
    return false;
  }
}

/**
 * Get the active Slack integration for an organization.
 * Used by the review save API routes (not user-context, so no userId filter).
 */
export async function getSlackIntegrationForOrg(
  db: ThinkThrooDatabase,
  organizationId: string,
) {
  const [row] = await db
    .select({
      accessToken: slackIntegrations.accessToken,
      channelId: slackIntegrations.channelId,
      webhookUrl: slackIntegrations.webhookUrl,
      notifyPrReviews: slackIntegrations.notifyPrReviews,
      notifyArchitectureViolations: slackIntegrations.notifyArchitectureViolations,
      isActive: slackIntegrations.isActive,
    })
    .from(slackIntegrations)
    .where(
      and(
        eq(slackIntegrations.organizationId, organizationId),
        eq(slackIntegrations.isActive, true),
      ),
    )
    .limit(1);

  return row ?? null;
}

/**
 * Send a PR Review summary to Slack.
 */
export async function notifyPrReview(
  db: ThinkThrooDatabase,
  organizationId: string,
  review: {
    repositoryFullName: string;
    prNumber: number;
    prTitle: string;
    prAuthor: string;
    summaryPoints: string[];
    fileResults?: {
      filename: string;
      violationCount: number;
      score: number;
    }[];
  },
): Promise<'sent' | 'skipped' | 'failed'> {
  const integration = await getSlackIntegrationForOrg(db, organizationId);

  if (!integration || !integration.isActive) return 'skipped';
  if (!integration.notifyPrReviews) return 'skipped';

  const summaryText = review.summaryPoints
    .map((point) => `• ${point}`)
    .join('\n');

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📋 PR Review Summary',
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Repository:*\n${review.repositoryFullName}` },
        { type: 'mrkdwn', text: `*PR:*\n#${review.prNumber}` },
        { type: 'mrkdwn', text: `*Title:*\n${review.prTitle}` },
        { type: 'mrkdwn', text: `*Author:*\n${review.prAuthor}` },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Summary:*\n${summaryText || '_No summary points_'}`,
      },
    },
  ];

  // Append architecture results if available
  if (review.fileResults && review.fileResults.length > 0) {
    const totalViolations = review.fileResults.reduce(
      (sum, f) => sum + f.violationCount,
      0,
    );
    const avgScore = Math.round(
      review.fileResults.reduce((sum, f) => sum + f.score, 0) /
        review.fileResults.length,
    );

    blocks.push({ type: 'divider' } as SlackBlock);

    if (totalViolations > 0) {
      blocks.push({
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Total Violations:*\n${totalViolations}` },
          { type: 'mrkdwn', text: `*Avg Score:*\n${avgScore}/100` },
        ],
      });

      const fileList = review.fileResults
        .filter((f) => f.violationCount > 0)
        .slice(0, 10)
        .map((f) => `• \`${f.filename}\` — ${f.violationCount} violation(s), score: ${f.score}`)
        .join('\n');

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Affected Files:*\n${fileList}`,
        },
      });
    } else {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ':white_check_mark: *No architecture violations detected*',
        },
      });
    }
  }

  const success = await postSlackMessage(
    integration.accessToken,
    integration.channelId,
    `PR Review: ${review.prTitle} (#${review.prNumber})`,
    blocks,
    integration.webhookUrl || undefined,
  );

  return success ? 'sent' : 'failed';
}
