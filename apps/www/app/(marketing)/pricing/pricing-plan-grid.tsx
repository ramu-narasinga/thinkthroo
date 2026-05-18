"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@thinkthroo/ui/components/badge"
import { Button } from "@thinkthroo/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@thinkthroo/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@thinkthroo/ui/components/dialog"
import { PricingFeatureList } from "@thinkthroo/ui/components/pricing-feature-list"
import { freeFeatures, proFeatures, pricing } from "@thinkthroo/ui/lib/pricing"
import { siteConfig } from "@/lib/config"

type PlanIntent = "free" | "pro"

export function PricingPlanGrid({ billing }: { billing: "monthly" | "yearly" }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [intent, setIntent] = useState<PlanIntent>("free")

  const priceInfo = billing === "monthly" ? pricing.monthly : pricing.yearly

  const openSignUp = (plan: PlanIntent) => {
    setIntent(plan)
    setDialogOpen(true)
  }

  return (
    <>
      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>For individuals & OSS</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-3xl font-bold">
              $0{" "}
              <span className="text-base font-normal text-muted-foreground">{pricing.monthly.label}</span>
            </p>
            <div className="mt-6">
              <PricingFeatureList features={freeFeatures} />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" type="button" onClick={() => openSignUp("free")}>
              Get Started
            </Button>
          </CardFooter>
        </Card>

        <Card className="relative border-primary flex flex-col">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>For growing teams</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-3xl font-bold">
              {priceInfo.amount}
              <span className="text-base font-normal text-muted-foreground"> {priceInfo.label}</span>
            </p>
            {billing === "yearly" && (
              <p className="text-sm text-green-600 font-medium mt-0.5">{pricing.yearly.note}</p>
            )}
            <div className="mt-6">
              <PricingFeatureList features={proFeatures} iconColor="text-primary" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="button" onClick={() => openSignUp("pro")}>
              Start Pro
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign up to continue</DialogTitle>
            <DialogDescription>
              {intent === "pro"
                ? "Create a free Think Throo account with GitHub first. After you sign in, open Account → Billing to upgrade to Pro."
                : "Create your free Think Throo account with GitHub to use the Free plan. You can upgrade to Pro anytime from Account → Billing."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-4">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Not now
            </Button>
            <Button type="button" asChild>
              <Link href={siteConfig.links.appLogin} target="_blank" rel="noopener noreferrer">
                Continue to sign up
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
