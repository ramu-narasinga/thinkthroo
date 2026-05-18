import { Button } from "@thinkthroo/ui/components/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@thinkthroo/ui/components/tabs"
import { Separator } from "@thinkthroo/ui/components/separator"
import { CreditBundleGrid } from "@thinkthroo/ui/components/credit-bundle-grid"
import { creditBundles } from "@thinkthroo/ui/lib/pricing"
import Link from "next/link"
import { PricingPlanGrid } from "./pricing-plan-grid"

export default function PricingPage() {
  return (
    <main className="container mx-auto px-4 py-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h1 className="text-4xl font-bold tracking-tight">
          Plans & pricing
        </h1>
        <p className="text-muted-foreground mt-4">
          Choose a plan that fits your team. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* Toggle */}
      <Tabs defaultValue="monthly" className="max-w-3xl mx-auto">
        <div className="flex justify-center mb-10">
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </div>

        {/* MONTHLY */}
        <TabsContent value="monthly">
          <PricingPlanGrid billing="monthly" />
        </TabsContent>

        {/* YEARLY */}
        <TabsContent value="yearly">
          <PricingPlanGrid billing="yearly" />
        </TabsContent>
      </Tabs>

      {/* Credit top-ups */}
      <div className="max-w-3xl mx-auto mt-14 space-y-4">
        <h2 className="text-xl font-semibold">Credit top-ups</h2>
        <p className="text-sm text-muted-foreground">
          Each PR review costs credits based on token usage. Buy a one-time top-up — no
          subscription required. 1 credit = $0.10 USD.
        </p>
        <CreditBundleGrid bundles={creditBundles} />
      </div>

      <Separator className="my-20" />

      {/* FAQ teaser */}
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold">Questions?</h2>
        <p className="text-muted-foreground mt-2">
          Need a custom plan or have security questions?
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link href="/contact">Contact Sales</Link>
        </Button>
      </div>
    </main>
  )
}
