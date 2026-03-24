"use client"

import { useState } from "react"
import { Check, ExternalLink, Loader2, X } from "lucide-react"
import { Button } from "@thinkthroo/ui/components/button"
import { Badge } from "@thinkthroo/ui/components/badge"
import { Switch } from "@thinkthroo/ui/components/switch"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import posthog from "posthog-js"

type Props = {
  open: boolean
  onClose: () => void
}

const openSourceFeatures = [
  "Pro for open source repos",
  "Limited security scans for 3 repos",
  "Security scans done biweekly",
]

const proFeatures = [
  "Code review for private repos",
  "Summaries and diagrams of code changes",
  "Line by line code reviews",
  "Limited security scans for 10 repos",
  "Security scans done biweekly",
  "Custom review rules",
]

const teamFeatures = [
  "Repo analytics",
  "Security scans for 200+ repos",
  "See and fix unlimited security issues",
  "Security scans done daily",
  "3x code review rate limits",
  "Bring your own LLM",
]

const enterpriseFeatures = [
  "Self-hosting option",
  "Priority support",
  "Customer success manager",
  "Invoice billing",
]

export default function ChangeSubscriptionPlanModal({ open, onClose }: Props) {
  const [proBilledYearly, setProBilledYearly] = useState(false)
  const [teamBilledYearly, setTeamBilledYearly] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  if (!open) return null

  async function handleUpgrade(plan: "pro" | "team" | "enterprise") {
    setLoadingPlan(plan)
    posthog.capture("upgrade_clicked", {
      plan,
      billedYearly: plan === "pro" ? proBilledYearly : plan === "team" ? teamBilledYearly : false,
      timestamp: new Date().toISOString(),
    })
    // Simulate brief loading then notify
    await new Promise((r) => setTimeout(r, 600))
    toast.success(
      plan === "enterprise"
        ? "We'll be in touch soon!"
        : `Upgrading to ${plan.charAt(0).toUpperCase() + plan.slice(1)} — checkout coming soon!`
    )
    setLoadingPlan(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-background w-full max-w-5xl rounded-xl shadow-xl overflow-y-auto max-h-[90vh]">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 pb-6">
          {/* Open Source */}
          <div className="rounded-xl border border-border p-5 flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-base">Open Source</span>
                <Badge variant="outline" className="text-xs">Current</Badge>
              </div>
              <p className="text-2xl font-bold">
                $0 <span className="text-sm font-normal text-muted-foreground">per user/month</span>
              </p>
            </div>

            <Button
              variant="outline"
              disabled
              className="w-full text-muted-foreground border-muted cursor-not-allowed"
            >
              Current plan
            </Button>

            <ul className="space-y-2 text-sm">
              {openSourceFeatures.map((f) => (
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
                <Badge variant="outline" className="text-xs text-foreground border-foreground">
                  Suggested
                </Badge>
              </div>
              <p className="text-2xl font-bold">
                $15 <span className="text-sm font-normal text-muted-foreground">per user/month</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Switch
                  checked={proBilledYearly}
                  onCheckedChange={setProBilledYearly}
                />
                <span className="text-sm text-muted-foreground">Billed yearly</span>
              </div>
            </div>

            <Button
              className="w-full bg-[#7000FF] text-white hover:bg-[#7000FF]/90 hover:brightness-110 hover:scale-[1.02] transition-all font-semibold"
              onClick={() => handleUpgrade("pro")}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === "pro" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upgrade"}
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

          {/* Team */}
          <div className="rounded-xl border border-border p-5 flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-base">Team</span>
              </div>
              <p className="text-2xl font-bold">
                $30 <span className="text-sm font-normal text-muted-foreground">per user/month</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Switch
                  checked={teamBilledYearly}
                  onCheckedChange={setTeamBilledYearly}
                />
                <span className="text-sm text-muted-foreground">Billed yearly</span>
              </div>
            </div>

            <Button
              className="w-full bg-[#7000FF] text-white hover:bg-[#7000FF]/90 hover:brightness-110 hover:scale-[1.02] transition-all font-semibold"
              onClick={() => handleUpgrade("team")}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === "team" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upgrade"}
            </Button>

            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Everything in Pro, plus:</p>
              <ul className="space-y-2">
                {teamFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#7000FF] mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Enterprise */}
          <div className="rounded-xl border border-border p-5 flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-base">Enterprise</span>
              </div>
              <p className="text-2xl font-bold">Talk to us</p>
            </div>

            <Button
              className="w-full bg-[#7000FF] text-white hover:bg-[#7000FF]/90 hover:brightness-110 hover:scale-[1.02] transition-all font-semibold"
              onClick={() => handleUpgrade("enterprise")}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === "enterprise" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Contact us"}
            </Button>

            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Everything in Team, plus:</p>
              <ul className="space-y-2">
                {enterpriseFeatures.map((f) => (
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
    </div>
  )
}
