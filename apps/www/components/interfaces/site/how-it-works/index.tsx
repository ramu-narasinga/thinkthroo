"use client"

import { useEffect, useRef, useState } from "react"
import { useUmami } from "@/hooks/use-umami"
import posthog from "posthog-js"

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const { track } = useUmami()

  // Start animation only when section becomes visible
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  // Auto step switch
  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev === 4 ? 1 : prev + 1))
    }, 4000)

    return () => clearInterval(interval)
  }, [activeStep, isVisible])

  const steps = [
    {
      number: 1,
      title: "Sign up and connect your runtime",
      description:
        "Install the Think Throo CLI on your machine. Authenticate with your Claude API key. Your local environment becomes a runtime agents can execute on.",
    },
    {
      number: 2,
      title: "Create your first agent",
      description:
        "Give it a name, write instructions, and attach skills. Agents activate automatically on assignment, comment, or @mention — just like a human teammate.",
    },
    {
      number: 3,
      title: "Assign a GitHub issue",
      description:
        "Pick the agent from the assignee dropdown on any issue — the same way you'd assign to a colleague. The task is queued and claimed automatically.",
    },
    {
      number: 4,
      title: "Watch it ship",
      description:
        "The agent reads the issue, writes code, opens a PR, and reports real-time progress. You review and merge. That's it.",
    },
  ]

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative w-full py-20 lg:py-32 bg-gradient-to-b from-background to-secondary/5"
    >
      {/* Background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_0%,transparent_80%)]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm font-semibold text-foreground">
              How It Works
            </span>
          </div>

          <h1 className="text-foreground leading-tighter max-w-2xl mb-6 mx-auto text-4xl font-semibold tracking-tight text-balance lg:leading-[1.1] xl:text-5xl">
            From issue to PR in 4 steps
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            A simple workflow to get AI agents working alongside your team
          </p>
        </div>

        {/* Layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step) => (
              <button
                key={step.number}
                onClick={() => {
                  setActiveStep(step.number)

                  track("how-it-works-step", {
                    step: step.number,
                    title: step.title,
                  })

                  posthog.capture("how_it_works_step_selected", {
                    step_number: step.number,
                    step_title: step.title,
                  })
                }}
                className="w-full text-left"
              >
                <div
                  className={`p-6 rounded-lg border transition-all duration-500 cursor-pointer group ${activeStep === step.number
                    ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card/70"
                    }`}
                >
                  <div className="flex gap-4">
                    {/* Number */}
                    <div className="flex-shrink-0">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-lg font-semibold text-sm transition-all duration-500 ${activeStep === step.number
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/20 text-primary group-hover:bg-primary/30"
                          }`}
                      >
                        {step.number}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                        {step.title}
                      </h3>

                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Animated Demo */}
          {/* Animated Demo */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full h-[550px] overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5">

              {/* Glow */}
              <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl animate-pulse" />

              {/* Main window */}
              <div className="absolute inset-6 rounded-2xl border border-border/50 bg-background/90 backdrop-blur shadow-2xl overflow-hidden">

                {/* Topbar */}
                <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3 bg-secondary/30">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />

                  <div className="ml-4 text-xs text-muted-foreground font-medium">
                    Think Throo
                  </div>
                </div>

                {/* STEP 1 */}
                {activeStep === 1 && (
                  <div className="h-full p-6 animate-fadeIn">
                    <div className="h-full rounded-xl border border-border/50 bg-background overflow-hidden">

                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-secondary/20">
                        <div>
                          <p className="text-sm font-medium">thinkthroo setup</p>
                          <p className="text-xs text-muted-foreground">CLI runtime setup</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-xs text-green-500">Runtime connected</span>
                        </div>
                      </div>

                      {/* CLI Output */}
                      <div className="p-5 space-y-3 font-mono text-sm">
                        <div className="animate-fadeIn" style={{ animationDelay: "0.1s" }}>
                          <span className="text-muted-foreground">$ </span>
                          <span className="text-foreground">npx thinkthroo setup</span>
                        </div>
                        <div className="animate-fadeIn text-muted-foreground text-xs" style={{ animationDelay: "0.4s" }}>
                          ✓ Authenticated with GitHub
                        </div>
                        <div className="animate-fadeIn text-muted-foreground text-xs" style={{ animationDelay: "0.7s" }}>
                          ✓ Claude API key configured
                        </div>
                        <div className="animate-fadeIn text-muted-foreground text-xs" style={{ animationDelay: "1.0s" }}>
                          ✓ Daemon started on port 3001
                        </div>
                        <div className="animate-fadeIn text-muted-foreground text-xs" style={{ animationDelay: "1.3s" }}>
                          ✓ Machine registered as runtime
                        </div>

                        <div className="mt-6 rounded-lg border border-green-500/20 bg-green-500/5 p-4 animate-fadeIn" style={{ animationDelay: "1.6s" }}>
                          <div className="text-xs font-semibold text-green-500 mb-2">Runtime ready</div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>Machine: MacBook Pro (arm64)</div>
                            <div>Model: claude-sonnet-4-6</div>
                            <div>Status: online</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {activeStep === 2 && (
                  <div className="h-full p-4 animate-fadeIn">
                    <div className="h-full rounded-xl border border-border/50 bg-background overflow-hidden">

                      {/* Header */}
                      <div className="px-4 py-3 border-b border-border/50 bg-secondary/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium">New Agent</h4>
                            <p className="text-xs text-muted-foreground">Configure your agent</p>
                          </div>
                          <div className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] text-primary">
                            Draft
                          </div>
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        <div className="animate-fadeIn" style={{ animationDelay: "0.2s" }}>
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Name</label>
                          <div className="rounded-md border border-border/50 bg-background px-3 py-2 text-sm text-foreground">
                            backend-engineer
                          </div>
                        </div>

                        <div className="animate-fadeIn" style={{ animationDelay: "0.5s" }}>
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Instructions</label>
                          <div className="rounded-md border border-border/50 bg-background px-3 py-2 text-xs text-muted-foreground min-h-[60px]">
                            You are a senior backend engineer. When assigned an issue, read the description carefully, implement the solution following existing patterns in the codebase, write tests, and open a PR.
                          </div>
                        </div>

                        <div className="animate-fadeIn" style={{ animationDelay: "0.8s" }}>
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Model</label>
                          <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary font-medium">
                            claude-sonnet-4-6
                          </div>
                        </div>

                        <div className="animate-fadeIn" style={{ animationDelay: "1.1s" }}>
                          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                            <div className="text-xs font-semibold text-green-500 mb-1">Agent created</div>
                            <div className="text-[11px] text-muted-foreground">Ready to receive issue assignments</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {activeStep === 3 && (
                  <div className="h-full p-6 animate-fadeIn">
                    <div className="h-full rounded-xl border border-border/50 bg-background overflow-hidden">

                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-secondary/20">
                        <div>
                          <h4 className="text-sm font-medium">Issue #42</h4>
                          <p className="text-xs text-muted-foreground">company/repo</p>
                        </div>
                        <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] text-amber-600 dark:text-amber-400">
                          In Progress
                        </div>
                      </div>

                      {/* Issue Window */}
                      <div className="p-5 space-y-4">
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            Add rate limiting to the API endpoints
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Opened by sarah · High priority
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground leading-relaxed">
                          We need to add rate limiting middleware to all public API routes to prevent abuse. Should support per-IP and per-user limits with Redis as the backing store.
                        </div>

                        <div className="border border-border/50 rounded-lg p-3">
                          <div className="text-xs font-medium text-muted-foreground mb-2">Assignee</div>
                          <div className="flex items-center gap-2 animate-fadeIn" style={{ animationDelay: "0.5s" }}>
                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">A</div>
                            <span className="text-xs font-medium text-foreground">backend-engineer</span>
                            <span className="text-[10px] text-primary ml-auto">Agent</span>
                          </div>
                        </div>

                        <div className="animate-fadeIn" style={{ animationDelay: "0.9s" }}>
                          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                            <div className="text-[11px] font-semibold text-primary mb-1">Task queued</div>
                            <div className="text-[11px] text-muted-foreground">Agent will pick this up on the next available runtime slot</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4 */}
                {activeStep === 4 && (
                  <div className="h-full p-6 animate-fadeIn">
                    <div className="h-full rounded-xl border border-border/50 bg-background overflow-hidden">

                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-secondary/20">
                        <div>
                          <h4 className="text-sm font-medium">Issue #42 · backend-engineer</h4>
                          <p className="text-xs text-muted-foreground">Agent is working · 6m 42s · 9 tool calls</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                          <span className="text-xs text-primary">In progress</span>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="space-y-2 text-xs text-muted-foreground font-mono">
                          <div className="animate-fadeIn flex gap-2" style={{ animationDelay: "0.1s" }}>
                            <span className="text-green-500">✓</span>
                            <span>Read issue description</span>
                          </div>
                          <div className="animate-fadeIn flex gap-2" style={{ animationDelay: "0.4s" }}>
                            <span className="text-green-500">✓</span>
                            <span>Explored codebase structure</span>
                          </div>
                          <div className="animate-fadeIn flex gap-2" style={{ animationDelay: "0.7s" }}>
                            <span className="text-green-500">✓</span>
                            <span>Created rate-limit middleware</span>
                          </div>
                          <div className="animate-fadeIn flex gap-2" style={{ animationDelay: "1.0s" }}>
                            <span className="text-green-500">✓</span>
                            <span>Applied to all API routes</span>
                          </div>
                          <div className="animate-fadeIn flex gap-2" style={{ animationDelay: "1.3s" }}>
                            <span className="text-green-500">✓</span>
                            <span>Wrote integration tests</span>
                          </div>
                          <div className="animate-fadeIn flex gap-2 text-primary" style={{ animationDelay: "1.6s" }}>
                            <span className="animate-pulse">→</span>
                            <span>Opening pull request...</span>
                          </div>
                        </div>

                        <div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/5 p-4 animate-fadeIn" style={{ animationDelay: "2s" }}>
                          <div className="text-xs font-semibold text-green-500 mb-1">PR #87 opened</div>
                          <div className="text-[11px] text-muted-foreground">feat: add Redis-backed rate limiting to API endpoints</div>
                          <div className="text-[11px] text-primary mt-2">Ready for your review →</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}