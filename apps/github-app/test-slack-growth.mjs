// Quick test — run with: node test-slack-growth.mjs
import { config } from "dotenv";
config();

const webhookUrl = process.env.SLACK_GROWTH_WEBHOOK_URL;

if (!webhookUrl || webhookUrl === "your_growth_channel_webhook_url_here") {
  console.error("❌ SLACK_GROWTH_WEBHOOK_URL is not set in .env");
  process.exit(1);
}

const message = {
  text: `:mag: *PR Review Posted* (test)`,
  attachments: [
    {
      color: "#4A154B",
      title: "#42 Fix auth bug",
      title_link: "https://github.com/test/repo/pull/42",
      fields: [
        { title: "Repository", value: "test/repo", short: true },
        { title: "Comments", value: "5", short: true },
      ],
      footer: "CodeArc GitHub App",
      ts: Math.floor(Date.now() / 1000),
    },
  ],
};

const res = await fetch(webhookUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(message),
});

if (res.ok) {
  console.log("✅ Message sent to #growth successfully!");
} else {
  console.error("❌ Failed:", res.status, await res.text());
}
