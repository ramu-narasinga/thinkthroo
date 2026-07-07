"use client"

import { useState } from "react"
import { Card, CardContent } from "@thinkthroo/ui/components/card"
import { Button } from "@thinkthroo/ui/components/button"
import { ArrowRight } from "lucide-react"
import { siteConfig } from "@/lib/config"

const promoMessages = [
  {
    heading: "Stop writing every fix yourself",
    body: "Register your machine as a Runtime, point it at your repo, and let coding agents pick up GitHub issues — they write the fix, you just review and merge.",
  },
  {
    heading: "Your engineering team, multiplied",
    body: "Create AI agents, assign them tasks like teammates, and watch them execute autonomously — powered by your own Claude API key.",
  },
  {
    heading: "From issue to PR, hands-off",
    body: "Agents clone the repo, write the fix, open the pull request. No babysitting, no manual triage.",
  },
  {
    heading: "Bring your own compute, ship faster",
    body: "Runtime runs on your own machine. Agents do the work; you keep full control and review every PR before it merges.",
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
      <span>Issue #421</span>
      <span className="text-yellow-500 animate-pulse">
        Agent working...
      </span>
    </div>

    <div className="h-2 rounded bg-muted overflow-hidden">
      <div className="h-full w-full bg-primary animate-[progress_4s_linear_infinite]" />
    </div>

    <div className="space-y-1">
      <div>✓ Agent picked up issue</div>
      <div>✓ Fix written</div>
      <div>✓ Branch pushed</div>
      <div className="text-green-500 font-medium">
        ✓ PR opened
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
                siteConfig.links.appLogin,
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
