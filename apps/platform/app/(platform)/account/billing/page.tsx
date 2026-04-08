"use client"

import { useState } from "react"
import { Button } from "@thinkthroo/ui/components/button"
import { Badge } from "@thinkthroo/ui/components/badge"
import { Switch } from "@thinkthroo/ui/components/switch"
import { Separator } from "@thinkthroo/ui/components/separator"
import { PricingFeatureList } from "@thinkthroo/ui/components/pricing-feature-list"
import { CreditBundleGrid } from "@thinkthroo/ui/components/credit-bundle-grid"
import { ArchitectureStorageGrid } from "@thinkthroo/ui/components/architecture-storage-grid"
import { freeFeatures, proFeatures, creditBundles, pricing } from "@thinkthroo/ui/lib/pricing"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { BuyCreditsModal } from "@/components/buy-credits-modal"
import { DowngradeModal } from "@/components/downgrade-modal"
import { usePaddle } from "@/hooks/usePaddle"
import { useOrganizationStore } from "@/store/organization"
import { organizationClientService } from "@/service/organization"
import { DataTable } from "@/components/subscription-table/data-table"
import { columns } from "@/components/subscription-table/columns"

export default function BillingPage() {
  const invoices: any[] = []
  const [billedYearly, setBilledYearly] = useState(false)
  const [loading, setLoading] = useState(false)
  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false)
  const [downgradeOpen, setDowngradeOpen] = useState(false)

  const activeOrgId = useOrganizationStore((s) => s.activeOrgId)
  const activeOrg = useOrganizationStore((s) =>
    s.organizations.find((o) => o.id === s.activeOrgId)
  )
  const fetchOrganizations = useOrganizationStore((s) => s.fetchOrganizations)
  const currentPlan = activeOrg?.currentPlanName ?? "free"
  const creditBalance = activeOrg?.creditBalance ?? "0"

  const paddle = usePaddle(
    async (data) => {
      const customerId = (data as any)?.customer?.id
      if (customerId && activeOrgId) {
        await organizationClientService.setPaddleCustomerId(activeOrgId, customerId)
      }
      await fetchOrganizations()
      toast.success("You're now on Pro! 500 credits have been added to your account.")
      setLoading(false)
    },
    () => {
      console.log("Checkout closed without completion")
      setLoading(false)
    },
  )

  const monthlyPriceId = process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID
  const yearlyPriceId = process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID
  const priceId = billedYearly ? yearlyPriceId : monthlyPriceId

  function handleUpgrade() {
    if (!paddle || !priceId || !activeOrgId) {
      toast.error("Checkout unavailable — missing configuration")
      return
    }
    setLoading(true)
    try {
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: { organizationId: activeOrgId },
        settings: { displayMode: "overlay", theme: "light", locale: "en" },
      })
    } catch {
      toast.error("Failed to open checkout")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="text-muted-foreground">
            Simple, usage-based pricing. Upgrade or top-up credits any time.
          </p>
          {currentPlan === "pro" && (
            <Badge className="bg-[#7000FF] text-white">You are on Pro</Badge>
          )}
        </div>

        {/* Yearly toggle */}
        <div className="flex items-center gap-3">
          <span className={cn("text-sm", !billedYearly && "font-semibold")}>Monthly</span>
          <Switch checked={billedYearly} onCheckedChange={setBilledYearly} />
          <span className={cn("text-sm", billedYearly && "font-semibold")}>
            Yearly
            <span className="ml-1.5 text-xs text-green-600 font-medium">Save ~14%</span>
          </span>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Free */}
          <div className="rounded-xl border border-border p-6 flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-lg">Free</span>
                {currentPlan === "free" && (
                  <Badge variant="outline" className="text-xs">Current plan</Badge>
                )}
              </div>
              <p className="text-3xl font-bold">
                $0
                <span className="text-base font-normal text-muted-foreground"> / month</span>
              </p>
            </div>

            {currentPlan === "free" ? (
              <Button variant="outline" disabled className="w-full cursor-not-allowed text-muted-foreground">
                Current plan
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full border-destructive text-destructive hover:bg-destructive/5"
                onClick={() => setDowngradeOpen(true)}
              >
                Downgrade to Free
              </Button>
            )}

            <PricingFeatureList features={freeFeatures} />
          </div>

          {/* Pro */}
          <div className="rounded-xl border-2 border-[#7000FF] p-6 flex flex-col gap-5 relative">
            <div className="absolute -top-3 left-6">
              <Badge className="bg-[#7000FF] text-white text-xs">Most popular</Badge>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-lg">Pro</span>
                {currentPlan === "pro" && (
                  <Badge variant="outline" className="text-xs">Current plan</Badge>
                )}
              </div>
              <p className="text-3xl font-bold">
                {billedYearly ? pricing.yearly.amount : pricing.monthly.amount}
                <span className="text-base font-normal text-muted-foreground"> {pricing.monthly.label}</span>
              </p>
              {billedYearly && (
                <p className="text-sm text-green-600 font-medium mt-0.5">{pricing.yearly.note}</p>
              )}
            </div>

            <Button
              className={cn(
                "w-full font-semibold transition-all",
                currentPlan === "pro"
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-[#7000FF] text-white hover:bg-[#7000FF]/90 hover:brightness-110 hover:scale-[1.02]"
              )}
              disabled={loading || currentPlan === "pro"}
              onClick={handleUpgrade}
            >
              {loading ? "Opening checkout…" : currentPlan === "pro" ? "Current plan" : "Upgrade to Pro"}
            </Button>

            <PricingFeatureList features={proFeatures} iconColor="text-[#7000FF]" />
          </div>
        </div>

        <Separator />

        {/* Architecture storage section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Architecture storage</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Each repository gets its own private vector index. Your rules are stored and scoped
              to your org — no cross-org leakage, ever.
            </p>
          </div>
          <ArchitectureStorageGrid />
        </div>

        <Separator />

        {/* Credit top-up section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Credit top-ups</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Each PR review costs credits based on token usage. If you run out mid-month, buy a
              one-time top-up — no subscription required. 1 credit = $0.10 USD.
            </p>
            {activeOrg && (
              <p className="text-sm mt-2">
                Your current balance:{" "}
                <span className="font-semibold">{Number(creditBalance).toFixed(0)} credits</span>
              </p>
            )}
          </div>
          <CreditBundleGrid bundles={creditBundles} />
          <Button
            variant="outline"
            className="border-[#7000FF] text-[#7000FF] hover:bg-[#7000FF]/5"
            onClick={() => setBuyCreditsOpen(true)}
          >
            Buy credits
          </Button>
          <p className="text-xs text-muted-foreground">
            Custom amount: enter any value between $5 and $100 using the buy credits dialog.
            10 credits are added per $1 spent.
          </p>
        </div>

        <Separator />

        {/* Invoices */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Invoices</h2>
          <DataTable columns={columns} data={invoices} />
        </div>

        <BuyCreditsModal open={buyCreditsOpen} onOpenChange={setBuyCreditsOpen} />
        <DowngradeModal open={downgradeOpen} onOpenChange={setDowngradeOpen} />
    </div>
  )
}
