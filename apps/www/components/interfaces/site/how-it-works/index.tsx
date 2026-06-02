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
      title: "Give access to your GitHub repositories",
      description:
        "Connect your repositories so CodeArc can analyze your code structure and understand your current architecture.",
    },
    {
      number: 2,
      title: "Define your codebase architecture",
      description:
        "We provide patterns inspired by top OSS projects, so you can use these patterns directly or hire us to establish custom standards tailored to your team.",
    },
    {
      number: 3,
      title: "AI-powered PR checks",
      description:
        "When you open a PR, your code is automatically checked against the architecture standards using AI. Violations surface as actionable feedback.",
    },
    {
      number: 4,
      title: "Resolve and stay consistent",
      description:
        "Address the comments to maintain consistency and follow established patterns across your entire codebase.",
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
            Architecture Enforcement in 4 Steps
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            A seamless workflow to enforce and maintain your codebase
            architecture across your team
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
                    CodeArc AI
                  </div>
                </div>

                {/* STEP 1 */}
                {activeStep === 1 && (
                  <div className="h-full p-6 animate-fadeIn">
                    <div className="h-full rounded-xl border border-border/50 bg-background overflow-hidden">

                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-secondary/20">
                        <div>
                          <p className="text-sm font-medium">
                            github.com/company/repo
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Repository connected
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-xs text-muted-foreground">
                            Connected
                          </span>
                        </div>
                      </div>

                      {/* Repository Tree */}
                      <div className="p-5 space-y-3 font-mono text-sm">

                        <div
                          className="flex items-center justify-between animate-fadeIn"
                          style={{ animationDelay: "0.2s" }}
                        >
                          <span>📁 apps</span>
                          <span className="text-green-500">✓</span>
                        </div>

                        <div
                          className="flex items-center justify-between animate-fadeIn"
                          style={{ animationDelay: "0.5s" }}
                        >
                          <span>📁 packages</span>
                          <span className="text-green-500">✓</span>
                        </div>

                        <div
                          className="flex items-center justify-between animate-fadeIn"
                          style={{ animationDelay: "0.8s" }}
                        >
                          <span>📁 components</span>
                          <span className="text-green-500">✓</span>
                        </div>

                        <div
                          className="flex items-center justify-between animate-fadeIn"
                          style={{ animationDelay: "1.1s" }}
                        >
                          <span>📁 docs</span>
                          <span className="text-green-500">✓</span>
                        </div>

                        {/* Scanner */}
                        <div className="mt-8">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">
                              Analyzing architecture...
                            </span>

                            <span className="text-xs text-primary">
                              100%
                            </span>
                          </div>

                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full w-full bg-primary animate-progress" />
                          </div>
                        </div>

                        {/* Results */}
                        <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
                          <div className="text-xs font-semibold text-primary mb-2">
                            Architecture Detected
                          </div>

                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>✓ Frontend Layer</div>
                            <div>✓ Shared Packages</div>
                            <div>✓ API Layer</div>
                            <div>✓ Monorepo Structure</div>
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
            <h4 className="text-sm font-medium">
              Architecture Blueprint
            </h4>

            <p className="text-xs text-muted-foreground">
              AI generating architecture rules...
            </p>
          </div>

          <div className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] text-primary animate-pulse">
            AI Generated
          </div>
        </div>
      </div>

      <div className="relative h-[340px]">

        {/* SVG Connections */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 600 340"
        >
          <line
            x1="300"
            y1="70"
            x2="200"
            y2="160"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary/40 animate-draw-line"
          />

          <line
            x1="300"
            y1="70"
            x2="400"
            y2="160"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary/40 animate-draw-line"
          />

          <line
            x1="200"
            y1="160"
            x2="300"
            y2="250"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary/40 animate-draw-line"
          />

          <line
            x1="400"
            y1="160"
            x2="300"
            y2="250"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary/40 animate-draw-line"
          />
        </svg>

        {/* Frontend */}
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 animate-fadeIn"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="px-4 py-3 rounded-xl border bg-background shadow-sm">
            <div className="text-xs font-semibold">
              Frontend
            </div>

            <div className="text-[10px] text-muted-foreground">
              apps/web
            </div>
          </div>
        </div>

        {/* Shared UI */}
        <div
          className="absolute left-10 top-[120px] animate-fadeIn"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="px-4 py-3 rounded-xl border bg-background shadow-sm">
            <div className="text-xs font-semibold">
              Shared UI
            </div>

            <div className="text-[10px] text-muted-foreground">
              packages/ui
            </div>
          </div>
        </div>

        {/* API */}
        <div
          className="absolute right-10 top-[120px] animate-fadeIn"
          style={{ animationDelay: "0.9s" }}
        >
          <div className="px-4 py-3 rounded-xl border bg-background shadow-sm">
            <div className="text-xs font-semibold">
              API Layer
            </div>

            <div className="text-[10px] text-muted-foreground">
              packages/api
            </div>
          </div>
        </div>

        {/* Core */}
        <div
          className="absolute left-1/2 bottom-[72px] -translate-x-1/2 animate-fadeIn"
          style={{ animationDelay: "1.2s" }}
        >
          <div className="px-4 py-3 rounded-xl border border-primary/20 bg-primary/5 shadow-sm">
            <div className="text-xs font-semibold text-primary">
              Core Domain
            </div>

            <div className="text-[10px] text-muted-foreground">
              packages/core
            </div>
          </div>
        </div>

        {/* Moving Pulse */}
        <div className="absolute left-1/2 top-[72px] -translate-x-1/2">
          <div className="h-3 w-3 rounded-full bg-primary animate-architecture-pulse" />
        </div>

        {/* Rules */}
        <div
          className="absolute bottom-2 left-4 right-4 rounded-lg border border-primary/20 bg-primary/5 p-3 animate-fadeIn"
          style={{ animationDelay: "1.6s" }}
        >
          <div className="text-[11px] font-medium text-primary mb-2">
            Generated Rules
          </div>

          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>✓ UI cannot import Core directly</div>
            <div>✓ API isolated from Frontend</div>
            <div>✓ Shared packages reusable</div>
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
                          <h4 className="text-sm font-medium">
                            Pull Request Review
                          </h4>

                          <p className="text-xs text-muted-foreground">
                            AI architecture enforcement
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-xs text-muted-foreground">
                            Running checks
                          </span>
                        </div>
                      </div>

                      {/* PR Window */}
                      <div className="p-5">

                        {/* PR Title */}
                        <div className="mb-6">
                          <div className="text-sm font-medium">
                            feat: add authentication flow
                          </div>

                          <div className="text-xs text-muted-foreground mt-1">
                            #248 opened by developer
                          </div>
                        </div>

                        {/* Changed Files */}
                        <div className="space-y-3">

                          <div className="rounded-lg border border-border/50 p-3">
                            <div className="flex justify-between">
                              <span className="text-xs font-mono">
                                apps/web/login.tsx
                              </span>

                              <span className="text-green-500 text-xs">
                                ✓ Passed
                              </span>
                            </div>
                          </div>

                          <div className="rounded-lg border border-border/50 p-3">
                            <div className="flex justify-between">
                              <span className="text-xs font-mono">
                                packages/ui/button.tsx
                              </span>

                              <span className="text-green-500 text-xs">
                                ✓ Passed
                              </span>
                            </div>
                          </div>

                          {/* Violation Card */}
                          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 animate-float">

                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-red-500">
                                Architecture Violation
                              </span>

                              <span className="text-[10px] px-2 py-1 rounded-full bg-red-500/10 text-red-500">
                                Critical
                              </span>
                            </div>

                            <div className="text-xs text-muted-foreground mb-3">
                              apps/web imported package directly from core domain.
                            </div>

                            <div className="rounded-md bg-background border border-border/50 p-3">
                              <div className="text-[11px] font-mono text-red-500">
                                import {"{ UserService }"} from "@core/user"
                              </div>
                            </div>

                            <div className="mt-3 text-[11px] text-primary">
                              Suggested Fix →
                              Use @api/user-client instead
                            </div>

                          </div>
                        </div>

                        {/* AI Badge */}
                        <div className="mt-5 flex justify-end">
                          <div className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] text-primary animate-pulse">
                            AI Review Complete
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
                          <h4 className="text-sm font-medium">
                            Architecture Compliance
                          </h4>

                          <p className="text-xs text-muted-foreground">
                            Changes verified automatically
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-xs text-green-500">
                            Passed
                          </span>
                        </div>
                      </div>

                      <div className="p-6 overflow-y-auto h-full">

                        {/* Timeline */}
                        <div className="space-y-4">

                          <div className="flex items-center gap-4 animate-fadeIn">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 text-xs">
                              ✓
                            </div>

                            <div>
                              <div className="text-sm font-medium">
                                Architecture issue resolved
                              </div>

                              <div className="text-xs text-muted-foreground">
                                Import updated to approved layer
                              </div>
                            </div>
                          </div>

                          <div
                            className="flex items-center gap-4 animate-fadeIn"
                            style={{ animationDelay: "0.5s" }}
                          >
                            <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 text-xs">
                              ✓
                            </div>

                            <div>
                              <div className="text-sm font-medium">
                                Pull request rechecked
                              </div>

                              <div className="text-xs text-muted-foreground">
                                AI validation completed
                              </div>
                            </div>
                          </div>

                          <div
                            className="flex items-center gap-4 animate-fadeIn"
                            style={{ animationDelay: "1s" }}
                          >
                            <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 text-xs">
                              ✓
                            </div>

                            <div>
                              <div className="text-sm font-medium">
                                Architecture compliant
                              </div>

                              <div className="text-xs text-muted-foreground">
                                No violations detected
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Score Card */}
                        <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/[0.03] p-5">

                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-medium">
                              Architecture Health
                            </span>

                            <span className="text-green-500 font-semibold">
                              98%
                            </span>
                          </div>

                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full w-[98%] bg-green-500 animate-pulse" />
                          </div>

                          <div className="grid grid-cols-3 gap-3 mt-5">

                            <div className="rounded-lg border border-border/50 p-3 text-center">
                              <div className="text-lg font-semibold">
                                42
                              </div>

                              <div className="text-[11px] text-muted-foreground">
                                Rules
                              </div>
                            </div>

                            <div className="rounded-lg border border-border/50 p-3 text-center">
                              <div className="text-lg font-semibold">
                                0
                              </div>

                              <div className="text-[11px] text-muted-foreground">
                                Violations
                              </div>
                            </div>

                            <div className="rounded-lg border border-border/50 p-3 text-center">
                              <div className="text-lg font-semibold">
                                100%
                              </div>

                              <div className="text-[11px] text-muted-foreground">
                                Coverage
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* Badge */}
                        <div className="mt-5 flex justify-end">
                          <div className="rounded-full border border-green-500/20 bg-green-500/5 px-3 py-1 text-[11px] text-green-500 animate-pulse">
                            Consistency Maintained ✓
                          </div>
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