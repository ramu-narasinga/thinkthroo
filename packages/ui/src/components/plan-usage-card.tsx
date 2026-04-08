"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@thinkthroo/ui/components/card"
import { Progress } from "@thinkthroo/ui/components/progress"
import { Button } from "@thinkthroo/ui/components/button"

export interface PlanUsageCardProps {
  planName: string
  /** Current credit balance */
  creditBalance: number
  /** Max credits for this plan */
  creditMax: number
  /** PRs reviewed this billing period */
  prsReviewed: number
  /** Max PRs for this plan — null means unlimited */
  prsMax: number | null
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

interface StatRowProps {
  label: string
  value: string
  progressPercent: number
  unlimited?: boolean
}

function StatRow({ label, value, progressPercent, unlimited }: StatRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <Progress
        value={unlimited ? 100 : progressPercent}
        className={`h-1.5 ${unlimited ? "opacity-30" : ""}`}
      />
    </div>
  )
}

export function PlanUsageCard({
  planName,
  creditBalance,
  creditMax,
  prsReviewed,
  prsMax,
  docStorageUsedMB,
  docStorageMaxMB,
  isPro,
  onBuyCredits,
  onUpgrade,
}: PlanUsageCardProps) {
  const creditPercent = Math.min(100, (creditBalance / Math.max(creditMax, 1)) * 100)
  const prsPercent = prsMax == null ? 100 : Math.min(100, (prsReviewed / Math.max(prsMax, 1)) * 100)
  const docPercent = Math.min(100, (docStorageUsedMB / Math.max(docStorageMaxMB, 1)) * 100)

  const prsLabel = prsMax == null
    ? `${prsReviewed} / Unlimited`
    : `${prsReviewed} / ${prsMax}`

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
        {/* Stats with progress bars */}
        <div className="space-y-3">
          <StatRow
            label="Credits remaining"
            value={`${creditBalance.toLocaleString()} / ${creditMax.toLocaleString()}`}
            progressPercent={creditPercent}
          />
          <StatRow
            label="PRs reviewed"
            value={prsLabel}
            progressPercent={prsPercent}
            unlimited={prsMax == null}
          />
          <StatRow
            label="Doc storage"
            value={docLabel}
            progressPercent={docPercent}
          />
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
