/**
 * Slack notification utility for the GitHub App.
 * Sends messages to a Slack Incoming Webhook URL.
 * Set SLACK_WEBHOOK_URL in your environment to enable notifications.
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
  appInstalled: (accountLogin: string, accountType: string, repoCount: number) =>
    sendSlackNotification({
      text: `:rocket: *New GitHub App Installation*`,
      attachments: [
        {
          color: "#36a64f",
          fields: [
            { title: "Account", value: accountLogin, short: true },
            { title: "Type", value: accountType, short: true },
            { title: "Repositories", value: String(repoCount), short: true },
          ],
          footer: "CodeArc GitHub App",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    }),

  appUninstalled: (accountLogin: string, accountType: string) =>
    sendSlackNotification({
      text: `:wave: *GitHub App Uninstalled* (Churn)`,
      attachments: [
        {
          color: "#e01e5a",
          fields: [
            { title: "Account", value: accountLogin, short: true },
            { title: "Type", value: accountType, short: true },
          ],
          footer: "CodeArc GitHub App",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    }),

  marketplacePurchase: (action: string, accountLogin: string, planName: string, priceInCents: number) => {
    const actionEmoji: Record<string, string> = {
      purchased: ":moneybag:",
      changed: ":arrows_counterclockwise:",
      cancelled: ":x:",
    };
    const actionColor: Record<string, string> = {
      purchased: "#36a64f",
      changed: "#f2c744",
      cancelled: "#e01e5a",
    };
    return sendSlackNotification({
      text: `${actionEmoji[action] ?? ":bell:"} *Marketplace ${action.charAt(0).toUpperCase() + action.slice(1)}*`,
      attachments: [
        {
          color: actionColor[action] ?? "#cccccc",
          fields: [
            { title: "Account", value: accountLogin, short: true },
            { title: "Plan", value: planName, short: true },
            { title: "Monthly Price", value: priceInCents === 0 ? "Free" : `$${(priceInCents / 100).toFixed(2)}`, short: true },
          ],
          footer: "CodeArc GitHub Marketplace",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    });
  },
};
