"use client"

import { useState } from "react"
import { Check, ExternalLink, Loader2, X } from "lucide-react"
import { Button } from "@thinkthroo/ui/components/button"
import { Badge } from "@thinkthroo/ui/components/badge"
import { Switch } from "@thinkthroo/ui/components/switch"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import posthog from "posthog-js"
import { usePaddle } from "@/hooks/usePaddle"
import { useOrganizationStore } from "@/store/organization"
import { organizationClientService } from "@/service/organization"

type Props = {
  open: boolean
  onClose: () => void
}

const freeFeatures = [
  "Architecture validation for public repos",
  "Up to 3 repositories",
  "10 free credits on signup",
]

const proFeatures = [
  "Architecture validation for private repos",
  "Unlimited repositories",
  "500 credits / month",
  "PR comment feedback",
  "Custom architecture rules",
]

export default function ChangeSubscriptionPlanModal({ open, onClose }: Props) {
  const [billedYearly, setBilledYearly] = useState(false)
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [downgrading, setDowngrading] = useState(false)

  const activeOrgId = useOrganizationStore((s) => s.activeOrgId)
  const activeOrg = useOrganizationStore((s) =>
    s.organizations.find((o) => o.id === s.activeOrgId)
  )
  const fetchOrganizations = useOrganizationStore((s) => s.fetchOrganizations)
  const currentPlan = activeOrg?.currentPlanName ?? "free"

  const paddle = usePaddle(
    async (data) => {
      const customerId = (data as any)?.customer?.id
      if (customerId && activeOrgId) {
        await organizationClientService.setPaddleCustomerId(activeOrgId, customerId)
      }
      await fetchOrganizations()
      toast.success("You're now on Pro! Your credits have been added.")
      setLoading(false)
      onClose()
    },
    () => setLoading(false),
  )

  async function handleDowngrade() {
    if (!activeOrgId) return
    setDowngrading(true)
    try {
      const result = await organizationClientService.cancelSubscription(activeOrgId)
      await fetchOrganizations()
      const dateStr = result?.effectiveAt
        ? new Date(result.effectiveAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : "end of billing period"
      toast.success(`Subscription cancelled. You'll stay on Pro until ${dateStr}.`)
      setConfirming(false)
      onClose()
    } catch {
      toast.error("Failed to cancel subscription. Please try again.")
    } finally {
      setDowngrading(false)
    }
  }

  if (!open) return null

  const monthlyPriceId = process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID
  const yearlyPriceId = process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID
  const priceId = billedYearly ? yearlyPriceId : monthlyPriceId

  async function handleUpgrade() {
    if (!paddle || !priceId || !activeOrgId) {
      toast.error("Checkout unavailable — missing configuration")
      return
    }

    setLoading(true)
    posthog.capture("upgrade_clicked", {
      plan: "pro",
      billedYearly,
      organizationId: activeOrgId,
    })

    try {
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: { organizationId: activeOrgId },
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "en",
        },
      })
    } catch {
      toast.error("Failed to open checkout")
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-background w-full max-w-2xl rounded-xl shadow-xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-xl font-semibold">Change subscription plan</h2>
          <div className="flex items-center gap-4">
            <a
              href="https://thinkthroo.com/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
            >
              Pricing
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 pb-6">
          {/* Free */}
          <div className="rounded-xl border border-border p-5 flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-base">Free</span>
                {currentPlan === "free" && (
                  <Badge variant="outline" className="text-xs">Current</Badge>
                )}
              </div>
              <p className="text-2xl font-bold">
                $0 <span className="text-sm font-normal text-muted-foreground">/ month</span>
              </p>
            </div>

            {currentPlan === "free" ? (
              <Button
                variant="outline"
                disabled
                className="w-full text-muted-foreground border-muted cursor-not-allowed"
              >
                Current plan
              </Button>
            ) : confirming ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">
                  Your Pro access continues until end of billing period.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-sm"
                    onClick={() => setConfirming(false)}
                    disabled={downgrading}
                  >
                    Keep Pro
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 text-sm"
                    onClick={handleDowngrade}
                    disabled={downgrading}
                  >
                    {downgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm downgrade"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full border-destructive text-destructive hover:bg-destructive/5"
                onClick={() => setConfirming(true)}
              >
                Downgrade to Free
              </Button>
            )}

            <ul className="space-y-2 text-sm">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#7000FF] mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="rounded-xl border-2 border-[#7000FF] p-5 flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-base">Pro</span>
                {currentPlan === "pro" ? (
                  <Badge variant="outline" className="text-xs">Current</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-foreground border-foreground">
                    Suggested
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-bold">
                {billedYearly ? "$42" : "$49"}
                <span className="text-sm font-normal text-muted-foreground"> / month</span>
              </p>
              {billedYearly && (
                <p className="text-xs text-green-600 font-medium mt-0.5">$504 billed yearly (~14% off)</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Switch checked={billedYearly} onCheckedChange={setBilledYearly} />
                <span className="text-sm text-muted-foreground">Billed yearly</span>
              </div>
            </div>

            <Button
              className={cn(
                "w-full font-semibold transition-all",
                currentPlan === "pro"
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-[#7000FF] text-white hover:bg-[#7000FF]/90 hover:brightness-110 hover:scale-[1.02]"
              )}
              onClick={handleUpgrade}
              disabled={!paddle || loading || currentPlan === "pro"}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : currentPlan === "pro" ? (
                "Current plan"
              ) : !paddle ? (
                "Loading…"
              ) : (
                "Upgrade now"
              )}
            </Button>

            <ul className="space-y-2 text-sm">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#7000FF] mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
