"use client"

import { useState } from "react"
import { CheckCircle, Zap, Layers, Sprout, TreeDeciduous, Hammer } from "lucide-react"
import { Card } from "@thinkthroo/ui/components/card"
import { Button } from "@thinkthroo/ui/components/button"

export function ArchitectureTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState("canopy")

  const templates = [
    {
      id: "canopy",
      name: "Canopy",
      icon: <TreeDeciduous />,
      description: "Inspired by LobeChat's architecture. 67.6k stars on GitHub.",
      rules: [
        "Server Components by default",
        "App Router structure enforced",
        "API routes in /api directory",
        "Strict TypeScript usage",
      ],
    },
    {
      id: "startFromScratch",
      name: "Start From Scratch",
      icon: <Hammer />,
      description: "Write your own codebase architecture from scratch, fully customizable.",
      rules: [
        "Server Components by default",
        "App Router structure enforced",
        "API routes in /api directory",
        "Strict TypeScript usage",
      ],
    },
  ]

  const templateCustomizations = {
    canopy: [
      {
        title: "Tech Stack",
        description: "Next.js, TypeScript, Tailwind CSS, tRPC, Drizzle ORM, Zustand.",
      },
      {
        title: "Project Standards",
        description: "Setup ESLint, Prettier, and commit hooks for code quality.",
      },
      {
        title: "Project Structure",
        description: "Define clear boundaries between features, components, and utilities.",
      },
      {
        title: "Component Structure",
        description: "Organize your components by colocation and feature-specific folders.",
      },
      {
        title: "API Layer",
        description: "Use tRPC and Drizzle for data fetching and mutations.",
      },
      {
        title: "State Management",
        description: "Use Zustand for client state. Create slices, actions and selectors depending on the complexity.",
      },
      {
        title: "Error Handling",
        description: "Define error.tsx and not-found.tsx for error management.",
      },
    ],
    startFromScratch: [
      {
        title: "Bring your own architecture",
        description: "Write your own architecture rules from the ground up.",
      },
    ],
  }

  const customizationOptions = templateCustomizations[selectedTemplate as keyof typeof templateCustomizations]

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate)

  return (
    <section className="relative w-full py-20 lg:py-32 bg-gradient-to-b from-secondary/10 to-background">
      {/* Background grid pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_0%,transparent_80%)]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Architecture Templates</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-balance leading-tight mb-6">
            Predefined & Fully Customizable
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Start with templates inspired by top open source projects, then customize rules for your team's specific
            needs
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-8 lg:gap-6 mb-12">
          {/* Left: Template Selector */}
          <div className="lg:col-span-1">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground px-2">Available Templates</h3>
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className="w-full text-left transition-all duration-300"
                >
                  <Card
                    className={`p-4 cursor-pointer border transition-all duration-300 group ${
                      selectedTemplate === template.id
                        ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10"
                        : "border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card/70"
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      <span className="text-2xl flex-shrink-0">{template.icon}</span>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-300">{template.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                      </div>
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          </div>

          {/* Middle: Template Details */}
          {/* <div className="lg:col-span-1">
            {selectedTemplateData && (
              <div
                className={`h-full rounded-lg border p-6 bg-gradient-to-br ${selectedTemplateData.color} ${selectedTemplateData.borderColor} transition-all duration-300`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{selectedTemplateData.icon}</span>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{selectedTemplateData.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedTemplateData.description}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Core Rules</h4>
                  {selectedTemplateData.rules.map((rule, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                      <span className="text-sm text-muted-foreground">{rule}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:opacity-90 transition-opacity duration-300">
                  Select This Template
                </button>
              </div>
            )}
          </div> */}

          {/* Right: Customization */}
          <div className="lg:col-span-3">
            <div className="h-full rounded-lg border border-border/50 bg-card/30 p-6 hover:border-border transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                {selectedTemplateData && (
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedTemplateData.icon}</span>
                    <h3 className="font-semibold text-foreground">{selectedTemplateData.name}</h3>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {selectedTemplate === "canopy"
                  ? "Pre-configured patterns from LobeChat's proven architecture. Customize further to match your team's needs."
                  : "Build your architecture rules from scratch with complete flexibility and control."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                {customizationOptions.map((option, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-md bg-background/50 border border-border/30 hover:border-border/60 transition-colors duration-300"
                  >
                    <h4 className="text-sm font-semibold text-foreground">{option.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                  </div>
                ))}
              </div>

              <div className="w-full flex justify-center">
                <Button variant="default" className="mt-6">Get Started</Button>
              </div>
            </div>
          </div>
        </div>

        {/* RAG Integration Section */}
        <div className="mt-16 lg:mt-20 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/2 p-8 lg:p-12">
          <div className="max-w-3xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-2">RAG-Powered PR Reviews</h3>
                <p className="text-muted-foreground">
                  Your architecture rules are embedded into the AI model. When you open a PR, the system retrieves
                  relevant rules and automatically reviews your code against them.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              <div className="p-4 rounded-lg bg-background/50 border border-border/30">
                <h4 className="font-semibold text-sm text-foreground mb-2">Smart Retrieval</h4>
                <p className="text-xs text-muted-foreground">
                  RAG identifies which rules apply to your specific code changes
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/30">
                <h4 className="font-semibold text-sm text-foreground mb-2">Contextual Feedback</h4>
                <p className="text-xs text-muted-foreground">
                  Violations surface with actionable explanations and examples
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/30">
                <h4 className="font-semibold text-sm text-foreground mb-2">Team Consistency</h4>
                <p className="text-xs text-muted-foreground">
                  Maintain standards across your entire codebase automatically
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
