"use client"

import { useState } from "react"
import { Card, CardContent } from "@thinkthroo/ui/components/card"
import { Button } from "@thinkthroo/ui/components/button"
import { ArrowRight } from "lucide-react"

const promoMessages = [
  {
    heading: "Need help implementing best practices at your company?",
    body: "We've studied how the best open-source codebases are built. We help teams adopt the same patterns to reduce tech debt and ship with confidence.",
  },
  {
    heading: "Keep Your Entire Team Aligned on Architecture",
    body: "We built a GitHub app that reviews every PR against architecture rules inspired by large OSS codebases, so your team stays consistent without manual reviews.",
  },
  {
    heading: "Your Codebase Deserves Consistent Patterns",
    body: "After studying patterns across large open-source projects, we help teams implement the same best practices, and enforce them with an automated PR reviewer.",
  },
  {
    heading: "Reduce Tech Debt Before It Piles Up",
    body: "We help teams define consistent architecture rules inspired by OSS and enforce them on every PR with a GitHub app, so best practices stick across the whole team.",
  },
]

export function PromoCard() {
  const [promo] = useState(
    () => promoMessages[Math.floor(Math.random() * promoMessages.length)]
  )

  return (
    <Card className="rounded-lg bg-muted/30 py-0">
      <CardContent className="p-4 space-x-2 space-y-2">
        <h4 className="text-lg font-semibold leading-tight">
          {promo.heading}
        </h4>

        <p className="text-sm text-muted-foreground leading-relaxed">
          <div className="mt-2 h-32 rounded-md border bg-background p-3 overflow-hidden">
  <div className="space-y-2 text-xs">
    <div className="flex items-center justify-between">
      <span>PR #421</span>
      <span className="text-yellow-500 animate-pulse">
        Reviewing...
      </span>
    </div>

    <div className="h-2 rounded bg-muted overflow-hidden">
      <div className="h-full w-full bg-primary animate-[progress_4s_linear_infinite]" />
    </div>

    <div className="space-y-1">
      <div>✓ Folder structure</div>
      <div>✓ Naming conventions</div>
      <div>✓ Architecture rules</div>
      <div className="text-green-500 font-medium">
        ✓ Approved
      </div>
    </div>
  </div>
</div>
        </p>

        <div className="flex items-center gap-3 pt-2">
          <Button
            className="cursor-pointer"
            size="sm"
            onClick={() =>
              window.open(
                "https://app.thinkthroo.com/skills-library",
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            Get Started for Free
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
