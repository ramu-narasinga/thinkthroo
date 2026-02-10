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
      <Tabs defaultValue="monthly" className="max-w-4xl mx-auto">
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
  const prices = {
    free: "₹0",
    pro: billing === "monthly" ? "₹999" : "₹9,999",
    enterprise: "Custom",
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* FREE */}
      <Card>
        <CardHeader>
          <CardTitle>Free</CardTitle>
          <CardDescription>For individuals & OSS</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{prices.free}</p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li>✔ Basic architecture checks</li>
            <li>✔ GitHub PR comments</li>
            <li>✖ Team rules</li>
            <li>✖ CI enforcement</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="outline">
            Get Started
          </Button>
        </CardFooter>
      </Card>

      {/* PRO */}
      <Card className="relative border-primary">
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most Popular
        </Badge>
        <CardHeader>
          <CardTitle>Pro</CardTitle>
          <CardDescription>For growing teams</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {prices.pro}
            <span className="text-sm text-muted-foreground">
              /{billing === "monthly" ? "mo" : "yr"}
            </span>
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li>✔ All Free features</li>
            <li>✔ Enforced architecture rules</li>
            <li>✔ CI blocking on violations</li>
            <li>✔ Up to 10 developers</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Start Pro</Button>
        </CardFooter>
      </Card>

      {/* ENTERPRISE */}
      <Card>
        <CardHeader>
          <CardTitle>Enterprise</CardTitle>
          <CardDescription>For large organizations</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{prices.enterprise}</p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li>✔ Everything in Pro</li>
            <li>✔ Unlimited developers</li>
            <li>✔ Custom rules & policies</li>
            <li>✔ Priority support</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="outline">
            Book a Demo
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
