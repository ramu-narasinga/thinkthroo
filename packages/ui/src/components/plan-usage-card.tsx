"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@thinkthroo/ui/components/card"
import { Progress } from "@thinkthroo/ui/components/progress"
import { Button } from "@thinkthroo/ui/components/button"

export interface PlanUsageCardProps {
  planName: string
  /** Current credit balance */
  creditBalance: number
  /** Current doc storage used in MB */
  docStorageUsedMB: number
  /** Max doc storage for this plan in MB */
  docStorageMaxMB: number
  /** Whether the org is on the Pro plan */
  isPro: boolean
  /** Called when "Buy Credits" is clicked (Pro only) */
  onBuyCredits: () => void
  /** Called when "Upgrade to Pro" is clicked (Free only) */
  onUpgrade: () => void
}

function formatMB(mb: number): string {
  if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`
  return `${mb % 1 === 0 ? mb : mb.toFixed(1)} MB`
}

export function PlanUsageCard({
  planName,
  creditBalance,
  docStorageUsedMB,
  docStorageMaxMB,
  isPro,
  onBuyCredits,
  onUpgrade,
}: PlanUsageCardProps) {
  const docPercent = Math.min(100, (docStorageUsedMB / Math.max(docStorageMaxMB, 1)) * 100)
  const docLabel = `${formatMB(docStorageUsedMB)} / ${formatMB(docStorageMaxMB)}`

  return (
    <Card className="gap-0 py-4 shadow-none">
      <CardHeader className="px-4 pb-3">
        <CardTitle className="text-sm font-semibold">
          Current Plan:{" "}
          <span className="capitalize">{planName}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Credits</span>
            <span className="font-medium tabular-nums">{creditBalance.toLocaleString()}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Doc storage</span>
              <span className="font-medium tabular-nums">{docLabel}</span>
            </div>
            <Progress value={docPercent} className="h-1.5" />
          </div>
        </div>

        {/* CTA */}
        {isPro ? (
          <Button
            className="cursor-pointer w-full shadow-none"
            size="sm"
            onClick={onBuyCredits}
            type="button"
          >
            Buy Credits
          </Button>
        ) : (
          <Button
            className="cursor-pointer w-full shadow-none"
            size="sm"
            type="button"
            onClick={onUpgrade}
          >
            Upgrade to Pro
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
