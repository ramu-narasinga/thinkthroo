"use client";

import { useState } from "react";
import {
  SkipForward,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle2,
  Circle,
} from "lucide-react";
import PrivatePageGuard from "@/components/private-page-guard";
import { Button } from "@thinkthroo/ui/components/button";
import { Separator } from "@thinkthroo/ui/components/separator";
import { Card, CardContent } from "@thinkthroo/ui/components/card";
import { cn } from "@/lib/utils";

type StepLink = {
  label: string;
  description: string;
  href: string;
};

type IntegrationItem = { name: string };

type IntegrationsContent = {
  left: { heading: string; items: IntegrationItem[]; actionLabel: string };
  right: { heading: string; items: IntegrationItem[]; note: string; actionLabel: string };
};

type Step = {
  id: string;
  title: string;
  completed: boolean;
  description: string;
  actionLabel?: string;
  links?: StepLink[];
  integrations?: IntegrationsContent;
};

const OPTIMIZE_STEPS: Step[] = [
  {
    id: "optimize-integrations",
    title: "Setup Integrations and MCP servers",
    completed: false,
    description: "",
    integrations: {
      left: {
        heading: "Connect your preferred tools",
        items: [{ name: "Jira" }, { name: "Linear" }, { name: "Circle CI" }],
        actionLabel: "View Integrations",
      },
      right: {
        heading: "Integrate with MCP servers",
        items: [{ name: "Context7" }, { name: "PostHog" }, { name: "Linear" }],
        note: "or setup custom MCP integrations.",
        actionLabel: "Setup MCP servers",
      },
    },
  },
  {
    id: "optimize-report",
    title: "Build your first report",
    completed: false,
    description:
      "Reports can be on-demand or auto generated on a recurring basis.\nMonitor performance from within your channels by integrating with Slack, Discord, Teams.",
    actionLabel: "Build a report",
  },
  {
    id: "optimize-analytics",
    title: "Explore analytics dashboard",
    completed: false,
    description:
      "Understand how CodeRabbit improves your engineering productivity, time to market and velocity.",
    actionLabel: "View Dashboard",
  },
];

const OPTIONAL_STEPS: Step[] = [
  {
    id: "optional-ide",
    title: "Boost productivity: Install CodeRabbit in your IDE/ CLI",
    completed: false,
    description: "Interact with CodeRabbit right from your IDE",
    links: [
      { label: "Cursor", description: "", href: "#" },
      { label: "VS Code", description: "", href: "#" },
      { label: "Windsurf", description: "", href: "#" },
      { label: "CLI", description: "", href: "#" },
    ],
  },
];

const STEPS: Step[] = [
  {
    id: "install",
    title: "Try CodeRabbit for free",
    completed: false,
    description:
      "Start a free trial to get all the features in the Pro Plus plan till your trial expires.",
    actionLabel: "Start your free trial",
  },
  {
    id: "review",
    title: "Checkout your first CodeArc review",
    completed: true,
    description:
      "Open a pull request and see CodeArc's architecture validation in action.",
    actionLabel: "View review",
  },
  {
    id: "personalize",
    title: "Personalize CodeArc",
    completed: true,
    description:
      "Fine-tune the way CodeRabbit integrates into your workflow.",
    links: [
      {
        label: "Set your review profile",
        description:
          "Chill vs Assertive, Assertive provides more detailed feedback that may be considered nitpicky.",
        href: "#",
      },
      {
        label: "Let CodeRabbit request changes on your PR",
        description:
          "Approve reviews once comments are resolved and all checks pass.",
        href: "#",
      },
      {
        label: "Summarize your PR",
        description:
          "Auto-generate a high-level summary in the PR/MR description.",
        href: "#",
      },
      {
        label: "Customize review with your own guides",
        description: "Add file path specific review guidelines.",
        href: "#",
      },
      {
        label: "Include or exclude files from review",
        description:
          "Use glob patterns to filter files (e.g., !dist/**, src/**). Applies to reviews and git sparse-checkout.",
        href: "#",
      },
    ],
  },
];

function CircularProgress({ value }: { value: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
      <circle
        cx="40"
        cy="40"
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="6"
      />
      <circle
        cx="40"
        cy="40"
        r={radius}
        fill="none"
        stroke="#ef4444"
        strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
      />
      <text
        x="40"
        y="45"
        textAnchor="middle"
        fontSize="14"
        fontWeight="600"
        fill="#111827"
      >
        {value}%
      </text>
    </svg>
  );
}

function SectionGroup({
  title,
  steps,
  expandedId,
  onToggle,
}: {
  title: string;
  steps: Step[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const completedCount = steps.filter((s) => s.completed).length;

  return (
    <div className="space-y-3">
      <Separator />
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-1 text-base font-semibold"
          onClick={() => setOpen((v) => !v)}
        >
          {title}
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <span className="text-sm text-muted-foreground">
          {completedCount} / {steps.length} done
        </span>
      </div>

      {open && (
        <div className="space-y-2">
          {steps.map((step) => {
            const isExpanded = expandedId === step.id;
            return (
              <div
                key={step.id}
                className={cn(
                  "rounded-lg border overflow-hidden",
                  step.completed && "bg-green-50 border-green-100"
                )}
              >
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                  onClick={() => onToggle(step.id)}
                >
                  <div className="flex items-center gap-3">
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-sm font-medium">{step.title}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  {isExpanded && !step.completed && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      Skip <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    {step.integrations ? (
                      <div className="grid grid-cols-2 divide-x">
                        {/* Left column */}
                        <div className="pr-6 space-y-3">
                          <p className="text-sm text-muted-foreground">
                            {step.integrations.left.heading}
                          </p>
                          <div className="space-y-2">
                            {step.integrations.left.items.map((item) => (
                              <div key={item.name} className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded border bg-muted shrink-0" />
                                <span className="text-sm">{item.name}</span>
                              </div>
                            ))}
                          </div>
                          <Button className="bg-orange-500 hover:bg-orange-600 text-white mt-2">
                            {step.integrations.left.actionLabel}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                        {/* Right column */}
                        <div className="pl-6 space-y-3">
                          <p className="text-sm text-muted-foreground">
                            {step.integrations.right.heading}
                          </p>
                          <div className="space-y-2">
                            {step.integrations.right.items.map((item) => (
                              <div key={item.name} className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded border bg-muted shrink-0" />
                                <span className="text-sm">{item.name}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {step.integrations.right.note}
                          </p>
                          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                            {step.integrations.right.actionLabel}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : step.links ? (
                      <div className="space-y-3">
                        {step.description && (
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        )}
                        {step.links.map((link) => (
                          <div key={link.label} className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded border bg-muted shrink-0" />
                            <a
                              href={link.href}
                              className="text-sm font-medium underline underline-offset-2 hover:text-foreground text-foreground/80"
                            >
                              {link.label}
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {step.description && (
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{step.description}</p>
                        )}
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                          {step.actionLabel}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  const [expandedId, setExpandedId] = useState<string | null>("install");

  const completedCount = STEPS.filter((s) => s.completed).length;
  const progress = Math.round((completedCount / STEPS.length) * 100);

  return (
    <PrivatePageGuard>
      <div className="space-y-0">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4">
          <h1 className="text-lg font-semibold">Getting started with CodeArc</h1>
          <Button variant="outline" size="sm">
            <SkipForward className="h-4 w-4" />
            Skip onboarding
          </Button>
        </div>
        <Separator />

        {/* Body */}
        <div className="px-8 py-6 space-y-6">
          {/* Progress banner */}
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <CircularProgress value={progress} />
                <div>
                  <p className="text-lg font-semibold">Good going! 🥕</p>
                  <p className="text-sm text-muted-foreground">
                    Learn more about CodeArc features to supercharge your workflows.
                  </p>
                </div>
              </div>
              <Button variant="outline">
                <FileText className="h-4 w-4" />
                View Documentation
              </Button>
            </CardContent>
          </Card>

          {/* Quick Start */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Quick Start</h2>
              <span className="text-sm text-muted-foreground">
                {completedCount} / {STEPS.length} done
              </span>
            </div>

            <div className="space-y-2">
              {STEPS.map((step) => {
                const isExpanded = expandedId === step.id;
                return (
                  <div
                    key={step.id}
                    className={cn(
                      "rounded-lg border overflow-hidden",
                      step.completed && "bg-green-50 border-green-100"
                    )}
                  >
                    {/* Step header */}
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 text-left"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : step.id)
                      }
                    >
                      <div className="flex items-center gap-3">
                        {step.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                        )}
                        <span className="text-sm font-medium">{step.title}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      {isExpanded && !step.completed && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          Skip <ArrowRight className="h-3 w-3" />
                        </span>
                      )}
                    </button>

                    {/* Step content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3">
                        {step.links ? (
                          <div className="space-y-3">
                            {step.description && (
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                            )}
                            {step.links.map((link) => (
                              <div key={link.label} className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded border bg-muted shrink-0" />
                                <a
                                  href={link.href}
                                  className="text-sm font-medium underline underline-offset-2 hover:text-foreground text-foreground/80"
                                >
                                  {link.label}
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            {step.description && (
                              <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {step.description}
                              </p>
                            )}
                            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                              {step.actionLabel}
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optimize Workflow */}
          <SectionGroup
            title="Optimize Workflow"
            steps={OPTIMIZE_STEPS}
            expandedId={expandedId}
            onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
          />

          {/* Optional */}
          <SectionGroup
            title="Optional"
            steps={OPTIONAL_STEPS}
            expandedId={expandedId}
            onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
          />
        </div>
      </div>
    </PrivatePageGuard>
  );
}
