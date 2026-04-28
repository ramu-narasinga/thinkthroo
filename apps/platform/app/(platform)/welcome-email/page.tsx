"use client";

import { Mail, User, Send } from "lucide-react";
import PrivatePageGuard from "@/components/private-page-guard";
import { Separator } from "@thinkthroo/ui/components/separator";
import { Card, CardContent } from "@thinkthroo/ui/components/card";

const PREVIEW_NAME = "John Doe";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.thinkthroo.com";

export default function WelcomeEmailPage() {
  const html = buildWelcomeEmailHtml(PREVIEW_NAME);

  return (
    <PrivatePageGuard>
      <div className="space-y-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-8 py-4">
          <Mail className="h-5 w-5 text-blue-500" />
          <h1 className="text-lg font-semibold">Welcome Email</h1>
        </div>
        <Separator />

        {/* Body */}
        <div className="px-8 py-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <User className="h-8 w-8 text-blue-500 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Preview Recipient</p>
                  <p className="text-base font-semibold">{PREVIEW_NAME}</p>
                  <p className="text-xs text-muted-foreground">sample user</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <Send className="h-8 w-8 text-green-500 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="text-base font-semibold">Welcome to ThinkThroo! 🎉</p>
                  <p className="text-xs text-muted-foreground">sent on signup</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email preview */}
          <Card>
            <CardContent className="p-0">
              <div className="px-4 py-3 text-xs font-medium text-muted-foreground border-b">
                Email Preview
              </div>
              <div className="p-4 bg-muted/30">
                <div
                  className="bg-white rounded border border-border overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PrivatePageGuard>
  );
}

// ---------------------------------------------------------------------------
// HTML template (inlined so the page has no server-side dependency)
// ---------------------------------------------------------------------------

function buildWelcomeEmailHtml(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to ThinkThroo</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #18181b;
    }
    .wrapper {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e4e4e7;
    }
    .header {
      background-color: #18181b;
      padding: 32px 40px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .body {
      padding: 40px;
    }
    .body p {
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 16px;
      color: #3f3f46;
    }
    .body p.greeting {
      font-size: 18px;
      font-weight: 600;
      color: #18181b;
    }
    .cta {
      display: inline-block;
      margin: 24px 0;
      padding: 12px 28px;
      background-color: #18181b;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 600;
    }
    .footer {
      padding: 24px 40px;
      border-top: 1px solid #e4e4e7;
      text-align: center;
      font-size: 13px;
      color: #a1a1aa;
    }
    .footer a {
      color: #a1a1aa;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>ThinkThroo</h1>
    </div>
    <div class="body">
      <p class="greeting">Welcome, ${name}! 👋</p>
      <p>
        We're excited to have you on board. ThinkThroo helps you learn how
        production-grade open-source codebases are built — one concept at a time.
      </p>
      <p>
        Start exploring real-world code patterns, architecture breakdowns, and
        guided lessons curated from the best projects in the ecosystem.
      </p>
      <a class="cta" href="${APP_URL}/dashboard">
        Go to Dashboard
      </a>
      <p>
        If you have any questions, just reply to this email — we're always
        happy to help.
      </p>
      <p>— The ThinkThroo Team</p>
    </div>
    <div class="footer">
      <p>
        You received this email because you signed up at
        <a href="https://thinkthroo.com">thinkthroo.com</a>.
      </p>
    </div>
  </div>
</body>
</html>`;
}
