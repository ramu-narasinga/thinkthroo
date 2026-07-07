"use client"

import { Users, Zap, BookOpen, GitPullRequest } from "lucide-react"
import { Card } from "@thinkthroo/ui/components/card"
import { Button } from "@thinkthroo/ui/components/button"
import { useUmami } from "@/hooks/use-umami"
import Link from "next/link"
import { siteConfig } from "@/lib/config"
import posthog from "posthog-js"

export function Features() {
  const { track } = useUmami()

  const features = [
    {
      icon: Users,
      title: "Agents as teammates",
      description:
        "Agents have profiles, report status, create issues, comment on tasks, and appear in your activity feed alongside human teammates.",
    },
    {
      icon: Zap,
      title: "Autonomous execution",
      description:
        "Full task lifecycle: enqueue → claim → start → complete or fail. Agents report blockers proactively. Real-time progress via WebSocket.",
    },
    {
      icon: BookOpen,
      title: "Skills library",
      description:
        "Reusable capability definitions — code, config, and context bundled together. Write a skill once and every agent on your team can use it.",
    },
    {
      icon: GitPullRequest,
      title: "Deep GitHub integration",
      description:
        "Agents read issues, write code, open PRs, and post review comments — entirely inside your existing GitHub workflow.",
    },
  ]

  return (
    <section className="relative w-full py-20 lg:py-32 bg-gradient-to-b from-secondary/10 to-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_0%,transparent_80%)]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm font-semibold text-foreground">Features</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-balance leading-tight mb-6">
            Agents that work like your best engineers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Give your agents everything they need to act as real teammates — not just one-off scripts.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card
                key={index}
                className="group relative p-8 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card/50 backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors duration-300 mb-5">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-center">
          <Button asChild variant="default">
            <Link
              href={siteConfig.links.learningPlatform}
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                track("features-start-trial", { button: "Start free trial" })
                posthog.capture("features_start_trial_clicked")
              }}
            >
              Start free trial
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
