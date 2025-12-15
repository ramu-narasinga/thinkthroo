"use client";
import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/interfaces/page/header";
import { Button } from "@thinkthroo/ui/components/components/button";
import { Announcement } from "../../page/announcement";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { useUmami } from "@/hooks/use-umami";

export function Hero() {
  const { track } = useUmami();
  return (
    <PageHeader>
      <Announcement />
      <PageHeaderHeading>
        AI Code Review that Enforces Codebase Architecture
      </PageHeaderHeading>
      <PageHeaderDescription>
        Stop AI slop from reaching your main branch. CodeArc enforces proven
        architecture patterns, catching violations before they compound into
        technical debt.
      </PageHeaderDescription>

      <PageActions>
        <Button asChild size="sm" variant="default">
          <Link
            target="_blank"
            rel="noreferrer"
            href={siteConfig.links.learningPlatform}
            onClick={() =>
              track("get-started", {
                button: "Get Started",
                href: siteConfig.links.learningPlatform,
              })
            }
          >
            Get Started
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link
            target="_blank"
            rel="noreferrer"
            href={siteConfig.links.consultation}
             onClick={() =>
              track("book-a-demo", {
                button: "Book a demo",
                href: siteConfig.links.consultation,
              })
            }
          >
            Book a demo
          </Link>
        </Button>
      </PageActions>
    </PageHeader>
  );
}
