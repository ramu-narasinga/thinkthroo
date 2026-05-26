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
                  className={`p-6 rounded-lg border transition-all duration-500 cursor-pointer group ${
                    activeStep === step.number
                      ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card/70"
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Number */}
                    <div className="flex-shrink-0">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-lg font-semibold text-sm transition-all duration-500 ${
                          activeStep === step.number
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
  <div className="relative w-full aspect-video overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5">

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
        <div className="h-full flex flex-col items-center justify-center gap-6 p-8 animate-fadeIn">

          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-2xl bg-black flex items-center justify-center text-white font-bold text-xl animate-float">
              GitHub
            </div>

            <div className="w-24 h-24 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold animate-pulse">
              AI
            </div>
          </div>

          <div className="w-[70%] h-3 rounded-full bg-primary/20 overflow-hidden">
            <div className="h-full w-[60%] bg-primary animate-scanHorizontal" />
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Connecting repositories and analyzing structure...
          </p>
        </div>
      )}

      {/* STEP 2 */}
      {activeStep === 2 && (
        <div className="h-full grid grid-cols-2 gap-4 p-6 animate-fadeIn">

          <div className="rounded-xl border border-border/50 bg-secondary/20 p-4 space-y-3">
            <div className="h-4 w-[80%] rounded bg-primary/20" />
            <div className="h-4 w-[60%] rounded bg-primary/10" />
            <div className="h-4 w-[90%] rounded bg-primary/20" />
            <div className="h-4 w-[50%] rounded bg-primary/10" />
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">

              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-xl bg-primary animate-float" />

              <div className="absolute bottom-0 left-0 w-16 h-16 rounded-xl bg-primary/60 animate-float delay-100" />

              <div className="absolute bottom-0 right-0 w-16 h-16 rounded-xl bg-primary/40 animate-float delay-200" />

              <svg className="absolute inset-0 w-full h-full">
                <line
                  x1="80"
                  y1="30"
                  x2="30"
                  y2="120"
                  stroke="currentColor"
                  className="text-primary/40"
                />
                <line
                  x1="80"
                  y1="30"
                  x2="130"
                  y2="120"
                  stroke="currentColor"
                  className="text-primary/40"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {activeStep === 3 && (
        <div className="h-full p-6 animate-fadeIn">

          <div className="rounded-xl border border-border/50 bg-secondary/20 p-4 font-mono text-sm space-y-4">

            <div className="h-4 w-[80%] rounded bg-primary/20 animate-pulse" />
            <div className="h-4 w-[60%] rounded bg-primary/10 animate-pulse" />
            <div className="h-4 w-[90%] rounded bg-primary/20 animate-pulse" />

            <div className="mt-8 rounded-lg border border-red-500/20 bg-red-500/10 p-4 animate-float">
              <div className="text-red-500 text-xs font-semibold mb-1">
                Architecture Violation
              </div>

              <div className="text-xs text-muted-foreground">
                UI layer importing backend module directly.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {activeStep === 4 && (
        <div className="h-full flex flex-col items-center justify-center gap-6 p-8 animate-fadeIn">

          <div className="w-28 h-28 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center animate-pulse">
            <div className="text-5xl text-green-500">
              ✓
            </div>
          </div>

          <div className="space-y-3 w-full max-w-[300px]">
            <div className="h-3 rounded-full bg-green-500/20" />
            <div className="h-3 rounded-full bg-green-500/10" />
            <div className="h-3 rounded-full bg-green-500/20" />
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Architecture consistency maintained successfully.
          </p>
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