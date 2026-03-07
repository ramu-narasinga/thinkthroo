/**
 * Slack notification utility for the Platform (Next.js).
 * Sends messages to a Slack Incoming Webhook URL.
 * Set SLACK_WEBHOOK_URL in your environment to enable notifications.
 * This module is server-side only.
 */

export interface SlackField {
  title: string;
  value: string;
  short?: boolean;
}

export interface SlackAttachment {
  color?: string;
  title?: string;
  text?: string;
  fields?: SlackField[];
  footer?: string;
  ts?: number;
}

export interface SlackMessage {
  text: string;
  attachments?: SlackAttachment[];
}

async function sendSlackNotification(message: SlackMessage): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error("[Slack] Failed to send notification", {
        status: response.status,
        statusText: response.statusText,
      });
    }
  } catch (err: any) {
    console.error("[Slack] Error sending notification", { error: err.message });
  }
}

export const SlackNotifier = {
  newSignup: (email: string) =>
    sendSlackNotification({
      text: `:tada: *New User Signup*`,
      attachments: [
        {
          color: "#36a64f",
          fields: [
            { title: "Email", value: email, short: true },
          ],
          footer: "CodeArc Platform",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    }),

  newLogin: (github: string, email: string) =>
    sendSlackNotification({
      text: `:wave: *New Login*`,
      attachments: [
        {
          color: "#4A90D9",
          fields: [
            { title: "GitHub", value: github, short: true },
            { title: "Email", value: email, short: true },
          ],
          footer: "Think Throo Platform",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    }),
};
