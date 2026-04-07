"use client"

import { useState } from "react"
import { Check, Loader2, Zap, BookOpen, GitPullRequest, Shield, Database } from "lucide-react"
import { Button } from "@thinkthroo/ui/components/button"
import { Badge } from "@thinkthroo/ui/components/badge"
import { Switch } from "@thinkthroo/ui/components/switch"
import { Separator } from "@thinkthroo/ui/components/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import PrivatePageGuard from "@/components/private-page-guard"
import { BuyCreditsModal } from "@/components/buy-credits-modal"
import { usePaddle } from "@/hooks/usePaddle"
import { useOrganizationStore } from "@/store/organization"
import { organizationClientService } from "@/service/organization"
import { DataTable } from "@/components/subscription-table/data-table"
import { columns } from "@/components/subscription-table/columns"

const freeFeatures = [
  { icon: GitPullRequest, text: "Architecture validation for public repos" },
  { icon: BookOpen, text: "Up to 3 architecture rule files" },
  { icon: Database, text: "3 Pinecone namespace docs (RAG context)" },
  { icon: Zap, text: "10 free credits on signup" },
  { icon: Shield, text: "Community support" },
]

const proFeatures = [
  { icon: GitPullRequest, text: "Architecture validation for private repos" },
  { icon: BookOpen, text: "Up to 20 architecture rule files" },
  { icon: Database, text: "20 Pinecone namespace docs (RAG context)" },
  { icon: Zap, text: "500 credits / month (renews with billing)" },
  { icon: Shield, text: "PR comment feedback with line-level context" },
  { icon: Check, text: "Custom architecture rules via markdown" },
  { icon: Check, text: "RAG-powered review — scoped to your rules only" },
  { icon: Check, text: "Priority support" },
]

const creditBundles = [
  { label: "50 credits", dollars: 5, description: "~5 small PRs" },
  { label: "100 credits", dollars: 10, description: "~10 small PRs" },
  { label: "250 credits", dollars: 25, description: "~25 small PRs" },
  { label: "500 credits", dollars: 50, description: "Best value" },
]

export default function BillingPage() {
  const invoices: any[] = []
  const [billedYearly, setBilledYearly] = useState(false)
  const [loading, setLoading] = useState(false)
  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [downgrading, setDowngrading] = useState(false)

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
    () => setLoading(false),
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
    } catch {
      toast.error("Failed to cancel subscription. Please try again.")
    } finally {
      setDowngrading(false)
    }
  }

  return (
    <PrivatePageGuard>
      <div className="p-6 max-w-5xl mx-auto space-y-10">
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

            <ul className="space-y-3">
              {freeFeatures.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2 text-sm">
                  <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
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
                {billedYearly ? "$42" : "$49"}
                <span className="text-base font-normal text-muted-foreground"> / month</span>
              </p>
              {billedYearly && (
                <p className="text-sm text-green-600 font-medium mt-0.5">$504 billed yearly</p>
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

            <ul className="space-y-3">
              {proFeatures.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2 text-sm">
                  <Icon className="w-4 h-4 text-[#7000FF] mt-0.5 shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        {/* Architecture storage section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Architecture storage (Pinecone)</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Each organisation gets a private Pinecone namespace. Your architecture rule files are
              indexed there — only your rules are used when reviewing PRs (no cross-org leakage).
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border p-4 space-y-1">
              <p className="font-medium text-sm">Free</p>
              <p className="text-2xl font-bold">3 <span className="text-base font-normal text-muted-foreground">architecture files</span></p>
              <p className="text-xs text-muted-foreground">Enough for small projects with focused rules</p>
            </div>
            <div className="rounded-lg border-2 border-[#7000FF] p-4 space-y-1">
              <p className="font-medium text-sm text-[#7000FF]">Pro</p>
              <p className="text-2xl font-bold">20 <span className="text-base font-normal text-muted-foreground">architecture files</span></p>
              <p className="text-xs text-muted-foreground">Full coverage for large monorepos and teams</p>
            </div>
          </div>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {creditBundles.map((bundle) => (
              <div
                key={bundle.dollars}
                className="rounded-lg border border-border p-4 flex flex-col gap-2 items-center text-center"
              >
                <p className="font-semibold text-sm">{bundle.label}</p>
                <p className="text-2xl font-bold">${bundle.dollars}</p>
                <p className="text-xs text-muted-foreground">{bundle.description}</p>
              </div>
            ))}
          </div>
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
      </div>
    </PrivatePageGuard>
  )
}
