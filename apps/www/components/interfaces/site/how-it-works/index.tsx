"use client"

import { useState } from "react"
import { Play } from "lucide-react"

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1)

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
    <section id="how-it-works" className="relative w-full py-20 lg:py-32 bg-gradient-to-b from-background to-secondary/5">
      {/* Background grid pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_0%,transparent_80%)]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm font-semibold text-primary">How It Works</span>
          </div>
          <h1 className="text-primary leading-tighter max-w-2xl mb-6 mx-auto text-4xl font-semibold tracking-tight text-balance lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter">
            Architecture Enforcement in 4 Steps
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            A seamless workflow to enforce and maintain your codebase architecture across your team
          </p>
        </div>

        {/* Steps and Video Layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step) => (
              <button key={step.number} onClick={() => setActiveStep(step.number)} className="w-full text-left">
                <div
                  className={`p-6 rounded-lg border transition-all duration-300 cursor-pointer group ${
                    activeStep === step.number
                      ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card/70"
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Step number badge */}
                    <div className="flex-shrink-0">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-lg font-semibold text-sm transition-all duration-300 ${
                          activeStep === step.number
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/20 text-primary group-hover:bg-primary/30"
                        }`}
                      >
                        {step.number}
                      </div>
                    </div>

                    {/* Step content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">{step.description}</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Video Placeholder with smooth transitions */}
          <div className="flex items-center justify-center">
            <div
              key={activeStep}
              className="w-full aspect-video bg-gradient-to-br from-primary/10 via-background to-primary/5 rounded-lg border border-primary/20 flex items-center justify-center group cursor-pointer hover:border-primary/40 transition-all duration-300 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="text-center relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 mb-4">
                  <Play className="w-6 h-6 text-primary fill-primary" />
                </div>
                <p className="text-muted-foreground text-sm mb-2">Demo video coming soon</p>
                <p className="text-xs text-muted-foreground/60">Step {activeStep} video</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
