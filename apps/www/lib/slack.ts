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

/** Resolves true only if Slack accepted the message; false if unconfigured or the post failed. */
async function sendSlackNotification(message: SlackMessage): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return false;
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
      return false;
    }

    return true;
  } catch (err: any) {
    console.error("[Slack] Error sending notification", { error: err.message });
    return false;
  }
}

// Optional attribution rows - skipped when empty.
const optionalField = (title: string, value?: string): SlackField[] =>
  value ? [{ title, value, short: true }] : [];

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
    phone?: string;
    pageSlug: string;
    projectType: string;
    budgetRange: string;
    description: string;
    gclid?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
    submissionId?: string;
  }) =>
    sendSlackNotification({
      text: `:moneybag: *New Consulting Lead* (${fields.pageSlug})`,
      attachments: [
        {
          color: "#2eb67d",
          fields: [
            { title: "Name", value: fields.name, short: true },
            { title: "Email", value: fields.workEmail, short: true },
            ...optionalField("Phone", fields.phone),
            { title: "Project type", value: fields.projectType, short: true },
            { title: "Budget", value: fields.budgetRange, short: true },
            { title: "Description", value: fields.description, short: false },
            ...optionalField("gclid", fields.gclid),
            ...optionalField("utm_source", fields.utmSource),
            ...optionalField("utm_medium", fields.utmMedium),
            ...optionalField("utm_campaign", fields.utmCampaign),
            ...optionalField("utm_term", fields.utmTerm),
            ...optionalField("utm_content", fields.utmContent),
            ...optionalField("submission_id", fields.submissionId),
          ],
          footer: "Think Throo Consulting",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    }),
};
