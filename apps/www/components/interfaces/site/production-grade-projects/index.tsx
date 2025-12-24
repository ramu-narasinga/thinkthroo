import { BookOpen, Code2, Zap, Lock, Gauge, AlertTriangle, Boxes, Rocket, Layers, TrendingUp, Building2 } from "lucide-react"
import { Card } from "@thinkthroo/ui/components/card"

export function ProductionGradeProjects() {
  const learningTopics = [
    {
      icon: Code2,
      title: "Project Standards & Tooling",
      description:
        "Learn the essential tooling setup and standards that production projects rely on for consistency and efficiency.",
    },
    {
      icon: Boxes,
      title: "Scalable Project St ructure",
      description:
        "Discover folder hierarchies and file organization patterns that scale with your team.",
    },
    {
      icon: Zap,
      title: "Component Structure",
      description:
        "Learn reusable component patterns, colocation strategies, and the architectural decisions that enable rapid development.",
    },
    {
      icon: BookOpen,
      title: "State Management",
      description: "Explore proven state management strategies that keep data flow predictable as complexity grows.",
    },
    {
      icon: Gauge,
      title: "API Layer Design",
      description:
        "Build centralized, type-safe API layers that prevent scattered fetch calls and maintain a single source of truth.",
    },
    {
      icon: AlertTriangle,
      title: "Error Handling",
      description:
        "Implement comprehensive error handling patterns that catch issues early and provide meaningful feedback to users.",
    },
    {
      icon: Rocket,
      title: "Performance Optimization",
      description:
        "Learn caching strategies, lazy loading, code splitting, and other techniques that keep your app blazingly fast.",
    },
    {
      icon: Lock,
      title: "Security & Deployment",
      description:
        "Understand security best practices and deployment workflows that make your code production-ready and maintainable.",
    },
  ]

  return (
    <section id="production-grade-projects" className="relative w-full py-20 lg:py-32 bg-gradient-to-b from-background to-secondary/5">
      {/* Background grid pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_0%,transparent_80%)]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm font-semibold text-primary">Production Grade Projects</span>
          </div>
          <h2 className="text-primary leading-tighter max-w-3xl mb-6 mx-auto text-4xl font-semibold tracking-tight text-balance lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter">
            Learn From Top Open-Source Projects
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Inspired by Bulletproof React, master how to build production-grade projects in Next.js using proven
            patterns from top open-source codebases. When you follow what well-established projects do, you're
            implementing industry best practices.
          </p>
        </div>

        {/* Learning Topics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {learningTopics.map((topic, index) => {
            const IconComponent = topic.icon
            return (
              <Card
                key={index}
                className="group relative p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card/50 backdrop-blur-sm flex flex-col"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none"></div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors duration-300 mb-4">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-3 flex-grow">{topic.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{topic.description}</p>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Value Proposition */}
        <div className="mt-16 lg:mt-24">
          <Card className="relative border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background p-8 lg:p-12 overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Benefit 1 */}
              <div className="flex flex-col items-start">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 mb-4">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Proven Patterns</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Study actual production codebases from projects trusted by thousands of developers. These aren't
                  theoretical concepts, they're battle-tested approaches.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="flex flex-col items-start">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Industry Standards</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Learn what separates hobby projects from production systems. Understand the decisions and trade-offs
                  that make code maintainable at scale.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="flex flex-col items-start">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 mb-4">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Organizational Impact</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Reduce technical debt and onboarding costs when teams adopt consistent, proven patterns. Build a
                  shared architectural language that accelerates collaboration and code reviews.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
