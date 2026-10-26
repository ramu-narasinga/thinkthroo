/**
 * Slack notification utility for the WWW app (Next.js).
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
  accessRequested: (githubLogin: string, email: string, note?: string) =>
    sendSlackNotification({
      text: `:raised_hand: *New Early Access Request*`,
      attachments: [
        {
          color: "#f2c744",
          fields: [
            { title: "GitHub", value: githubLogin, short: true },
            { title: "Email", value: email, short: true },
            ...(note ? [{ title: "Note", value: note, short: false }] : []),
          ],
          footer: "CodeArc WWW",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    }),

  consultingLeadReceived: (fields: {
    name: string;
    workEmail: string;
    pageSlug: string;
    projectType: string;
    budgetRange: string;
    description: string;
    gclid?: string;
    utmSource?: string;
    utmCampaign?: string;
  }) =>
    sendSlackNotification({
      text: `:moneybag: *New Consulting Lead* (${fields.pageSlug})`,
      attachments: [
        {
          color: "#2eb67d",
          fields: [
            { title: "Name", value: fields.name, short: true },
            { title: "Email", value: fields.workEmail, short: true },
            { title: "Project type", value: fields.projectType, short: true },
            { title: "Budget", value: fields.budgetRange, short: true },
            { title: "Description", value: fields.description, short: false },
            ...(fields.gclid ? [{ title: "gclid", value: fields.gclid, short: true }] : []),
            ...(fields.utmSource
              ? [{ title: "utm_source", value: fields.utmSource, short: true }]
              : []),
            ...(fields.utmCampaign
              ? [{ title: "utm_campaign", value: fields.utmCampaign, short: true }]
              : []),
          ],
          footer: "Think Throo Consulting",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    }),
};
