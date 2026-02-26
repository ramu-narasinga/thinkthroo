"use client"

import { useState } from "react"
import { Card, CardContent } from "@thinkthroo/ui/components/card"
import { Button } from "@thinkthroo/ui/components/button"

const promoMessages = [
  {
    heading: "Your PR Reviews Are Missing Architecture Violations",
    body: "Think Throo catches violations in every PR using AI + your architecture rules.",
  },
  {
    heading: "Stop Architecture Decay Before It Starts",
    body: "Think Throo enforces your architecture rules on every pull request automatically.",
  },
  {
    heading: "Your Team Is Drifting From Your Architecture",
    body: "Think Throo keeps every contributor aligned with your codebase architecture on every PR.",
  },
  {
    heading: "Catch Architecture Violations, Not Just Bugs",
    body: "Think Throo reviews every PR against your architecture rules — so you don't have to.",
  },
  {
    heading: "Architecture Rules Without the Manual Review",
    body: "Think Throo automates architecture validation using AI so your standards are always enforced.",
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
          {promo.body}
        </p>

        <div className="flex items-center gap-3 pt-2">
          <Button
            className="cursor-pointer"
            size="sm"
            onClick={() =>
              window.open(
                "https://app.thinkthroo.com/repositories",
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            Install Think Throo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
