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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@thinkthroo/ui/components/tabs"
import { Separator } from "@thinkthroo/ui/components/separator"
import { PricingFeatureList } from "@thinkthroo/ui/components/pricing-feature-list"
import { CreditBundleGrid } from "@thinkthroo/ui/components/credit-bundle-grid"
import { freeFeatures, proFeatures, creditBundles, pricing } from "@thinkthroo/ui/lib/pricing"
import Link from "next/link"

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
          <PricingGrid billing="monthly" />
        </TabsContent>

        {/* YEARLY */}
        <TabsContent value="yearly">
          <PricingGrid billing="yearly" />
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
        <Button variant="outline" className="mt-6">
          Contact Sales
        </Button>
      </div>
    </main>
  )
}

function PricingGrid({ billing }: { billing: "monthly" | "yearly" }) {
  const priceInfo = billing === "monthly" ? pricing.monthly : pricing.yearly

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
      {/* FREE */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Free</CardTitle>
          <CardDescription>For individuals & OSS</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-3xl font-bold">$0 <span className="text-base font-normal text-muted-foreground">{pricing.monthly.label}</span></p>
          <div className="mt-6">
            <PricingFeatureList features={freeFeatures} />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="outline" asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </CardFooter>
      </Card>

      {/* PRO */}
      <Card className="relative border-primary flex flex-col">
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most Popular
        </Badge>
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
          <Button className="w-full" asChild>
            <Link href="/sign-up">Start Pro</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
