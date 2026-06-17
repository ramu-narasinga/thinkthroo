"use client";

import { useEffect } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/interfaces/page/header";
import { Button } from "@thinkthroo/ui/components/button";
import { Card } from "@thinkthroo/ui/components/card";

function rdtTrack(event: string) {
  if (
    typeof window !== "undefined" &&
    (window as unknown as { rdt?: (a: string, e: string) => void }).rdt
  ) {
    (window as unknown as { rdt: (a: string, e: string) => void }).rdt(
      "track",
      event
    );
  }
}

function SkillsPixelEvents() {
  useEffect(() => {
    rdtTrack("ViewContent");
    posthog.capture("skills_page_viewed");
  }, []);
  return null;
}

function handleCta(label: string) {
  rdtTrack("Lead");
  posthog.capture("skills_cta_clicked", { cta_label: label });
}

const RULES = [
  "project-structure.md",
  "api-layer.md",
  "components-structure.md",
  "state-management.md",
  "testing.md",
  "error-handling.md",
  "security.md",
  "performance.md",
  "deployment.md",
  "project-standards.md",
];

const TEASER = `# project-structure.md

Use a feature-driven folder structure:

src/
  features/
    auth/
      components/
      hooks/
      api.ts
  shared/
  lib/`;

const STEPS = [
  {
    number: 1,
    name: "Install skills",
    desc: "Run the install command. Your AI coding assistant loads your architecture rules before writing any code.",
    entry: "npx skills add thinkthroo/toucan",
  },
  {
    number: 2,
    name: "Auto-review every PR",
    desc: "The thinkthroo GitHub app checks every pull request against your skill rules automatically on PR open.",
    entry: "Install the thinkthroo GitHub app",
  },
  {
    number: 3,
    name: "Catch violations before they merge",
    desc: "RAG-based pattern matching flags architecture deviations with actionable feedback before they reach main.",
    entry: "Enabled from your dashboard",
  },
];

const BLOGS = [
  {
    label: "Skills folder in shadcn/ui codebase",
    slug: "skills-folder-in-shadcn-ui-codebase-part-1-1",
  },
  {
    label: "Skills folder in Langfuse codebase",
    slug: "skills-folder-in-langfuse-codebase",
  },
  {
    label: "Skills folder in LobeHub codebase",
    slug: "agents-skills-folder-in-lobehub-codebase-part-1-1",
  },
];

const TECH = [
  "React",
  "TypeScript",
  "TanStack Query",
  "Zustand",
  "shadcn/ui",
  "Vite",
];

export default function SkillsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SkillsPixelEvents />

      {/* ── Hero ── */}
      <PageHeader>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-2">
          <span className="text-sm font-semibold text-primary">
            Works with Claude Code · GitHub Copilot / VS Code
          </span>
        </div>

        <PageHeaderHeading className="text-foreground">
          Production-grade codebase architecture for your team
        </PageHeaderHeading>

        <PageHeaderDescription>
          Skills are markdown rule files that train Claude Code and GitHub
          Copilot to write code the right way — every time.
        </PageHeaderDescription>

        <div className="font-mono text-sm bg-secondary/60 border rounded-xl px-6 py-3 text-foreground mt-2">
          npx skills add thinkthroo/toucan
        </div>

        <PageActions>
          <Button asChild size="sm" variant="default">
            <Link
              href="https://app.thinkthroo.com/skills-library"
              target="_blank"
              rel="noreferrer"
              onClick={() => handleCta("hero_browse")}
            >
              Browse the Skills Library
            </Link>
          </Button>
          <Button asChild size="sm" variant="outdefaultline">
            <Link
              href="https://app.thinkthroo.com/skills-library/toucan-codebase-architecture"
              target="_blank"
              rel="noreferrer"
              onClick={() => handleCta("hero_preview")}
            >
              View Toucan Skill
            </Link>
          </Button>
        </PageActions>
      </PageHeader>

      {/* ── What are skills? ── */}
      <section className="relative w-full py-20 lg:py-32 bg-gradient-to-b from-background to-secondary/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_0%,transparent_80%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="text-sm font-semibold text-foreground">
                What are skills?
              </span>
            </div>
            <h2 className="text-foreground leading-tighter max-w-2xl mb-6 mx-auto text-4xl font-semibold tracking-tight text-balance lg:leading-[1.1] xl:text-5xl">
              Architecture rules your AI coding assistant actually follows
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Skills encode your team&apos;s architecture decisions — folder
              structure, API patterns, component rules, state management — so the
              AI follows your standards instead of guessing.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Inspired by{" "}
                <a
                  href="https://github.com/alan2207/bulletproof-react"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-foreground hover:text-primary transition-colors"
                >
                  bulletproof-react
                </a>{" "}
                and the patterns used in production open-source projects like
                Umami and ACI dev. These are the same architecture standards
                OSS projects already uses — now enforced automatically.
              </p>

              <p className="text-sm font-medium text-foreground mb-3">
                Industry-standard tech stack:
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {TECH.map((t) => (
                  <span
                    key={t}
                    className="border border-border/60 rounded-md px-3 py-1 text-xs font-medium text-muted-foreground bg-card/50"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <p className="text-sm font-medium text-foreground mb-3">
                See how skills are used in real codebases:
              </p>
              <ul className="flex flex-col gap-2">
                {BLOGS.map((b) => (
                  <li key={b.slug}>
                    <Link
                      href={`/blog/${b.slug}`}
                      className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors"
                    >
                      {b.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <Card className="p-6 border border-border/50 bg-card/50 backdrop-blur-sm">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Skill structure — toucan-codebase-architecture
              </p>
              <div className="flex flex-col gap-1.5 mb-6">
                {RULES.map((r) => (
                  <div
                    key={r}
                    className="flex items-center gap-3 text-sm text-foreground/80"
                  >
                    <span className="text-primary text-xs">▸</span>
                    <span className="font-mono text-xs">{r}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/40 pt-4">
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  Preview — project-structure.md
                </p>
                <div className="relative rounded-lg overflow-hidden">
                  <pre className="bg-secondary/40 text-foreground text-xs font-mono p-4 rounded-lg leading-relaxed whitespace-pre">
                    {TEASER}
                  </pre>
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-card/90 to-transparent pointer-events-none" />
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="sm" variant="default">
              <Link
                href="https://app.thinkthroo.com/skills-library/toucan-codebase-architecture"
                target="_blank"
                rel="noreferrer"
                onClick={() => handleCta("skill_preview")}
              >
                View full skill →
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative w-full py-20 lg:py-32 bg-gradient-to-b from-background to-secondary/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_0%,transparent_80%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="text-sm font-semibold text-foreground">
                How it works
              </span>
            </div>
            <h2 className="text-foreground leading-tighter max-w-2xl mb-6 mx-auto text-4xl font-semibold tracking-tight text-balance lg:leading-[1.1] xl:text-5xl">
              From vibe-coded mess to enforced architecture
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Three steps that give your team consistent, production-grade code
              — without adding manual review overhead.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <Card
                key={step.number}
                className="group relative p-8 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card/50 backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors duration-300 mb-5 font-semibold text-sm text-primary">
                    {step.number}
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step.name}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                    {step.desc}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground/70 bg-secondary/40 rounded-md px-3 py-2">
                    {step.entry}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <p className="mt-12 text-center text-sm text-muted-foreground">
            Need help getting started?{" "}
            <Link
              href="/contact"
              className="underline text-foreground hover:text-primary transition-colors"
            >
              Contact us
            </Link>
          </p>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative w-full py-20 lg:py-32 bg-gradient-to-b from-background to-secondary/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_0%,transparent_80%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-foreground leading-tighter max-w-2xl mb-4 mx-auto text-4xl font-semibold tracking-tight text-balance lg:leading-[1.1] xl:text-5xl">
            Start with skills — free
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto text-balance mb-8">
            Install the skill, let your AI write to your architecture standards,
            and connect PR review when your team is ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Button asChild size="sm" variant="default">
              <Link
                href="https://app.thinkthroo.com/skills-library"
                target="_blank"
                rel="noreferrer"
                onClick={() => handleCta("bottom_start")}
              >
                Browse the Skills Library
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link
                href="https://github.com/apps/thinkthroo"
                target="_blank"
                rel="noreferrer"
                onClick={() => handleCta("bottom_pr_review")}
              >
                Already using skills? Connect PR review →
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
