"use client";
import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/interfaces/page/header";
import { Button } from "@thinkthroo/ui/components/button";
import { Announcement } from "../../page/announcement";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { useUmami } from "@/hooks/use-umami";
import posthog from "posthog-js";

export function Hero() {
  const { track } = useUmami();
  return (
    <PageHeader>
      <Announcement />
      <PageHeaderHeading className="text-foreground">
        Build your agent team. Ship more code.
      </PageHeaderHeading>
      <PageHeaderDescription>
        Think Throo turns your tasks into shipped code. Create AI agents,
        assign them tasks like teammates, and watch them execute autonomously —
        powered by your own Claude API key.
      </PageHeaderDescription>

      <PageActions>
        <Button asChild size="sm" variant="default">
          <Link
            target="_blank"
            rel="noreferrer"
            href={siteConfig.links.learningPlatform}
            onClick={() => {
              track("start-free-trial", {
                button: "Start free trial",
                href: siteConfig.links.learningPlatform,
              });
              posthog.capture("hero_start_trial_clicked", {
                button: "Start free trial",
                href: siteConfig.links.learningPlatform,
              });
            }}
          >
            Start free trial
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link
            target="_blank"
            rel="noreferrer"
            href={siteConfig.links.consultation}
            onClick={() => {
              track("book-a-demo", {
                button: "Book a demo",
                href: siteConfig.links.consultation,
              });
              posthog.capture("hero_book_demo_clicked", {
                button: "Book a demo",
                href: siteConfig.links.consultation,
              });
            }}
          >
            Book a demo
          </Link>
        </Button>
      </PageActions>
      <p className="text-sm text-muted-foreground">7-day free trial · No credit card required</p>
    </PageHeader>
  );
}
