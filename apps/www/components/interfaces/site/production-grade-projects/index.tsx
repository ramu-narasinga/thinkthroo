import Link from "next/link"
import { siteConfig } from "@/lib/config"

export function ProductionGradeProjects() {
  const chips = [
    "Proven patterns from real codebases",
    "Industry-standard architecture decisions",
    "shadcn/ui · Supabase · more coming",
  ]

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border/50 bg-card/30 p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <span className="text-xs font-semibold text-foreground">Learn</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-semibold text-foreground mb-3">
                Built on production-grade patterns
              </h2>
              <p className="text-muted-foreground">
                Explore how top open-source projects like shadcn/ui and Supabase are structured. The patterns behind Think Throo come from real production codebases, not theory.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {chips.map((chip, index) => (
                <div
                  key={index}
                  className="px-4 py-2 rounded-lg border border-border/50 bg-background text-sm text-muted-foreground"
                >
                  {chip}
                </div>
              ))}
              <Link
                href={siteConfig.links.learningPlatform}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary hover:underline mt-1"
              >
                Browse courses →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
