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
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
      {/* FREE */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Free</CardTitle>
          <CardDescription>For individuals & OSS</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-3xl font-bold">{prices.free}</p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li>✔ Unlimited public and private repositories</li>
            <li>✔ PR Summarization</li>
            <li>✔ Slack Integration</li>
            <li>✔ PR Analytics</li>
            <li>✔ Skills Library</li>
            <li>✔ OSS codebase architecture guides for inspiration</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="outline">
            Get Started
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
            {prices.pro}
            <span className="text-sm text-muted-foreground">
              /{billing === "monthly" ? "mo" : "yr"}/developer
            </span>
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li>✔ Everything in Free</li>
            <li>✔ Define codebase architecture rules</li>
            <li>✔ RAG enforced architecture review on every PR</li>
            <li>✔ Line by line code reviews</li>
            <li>✔ Architecture violation scores reported via Slack</li>
            <li>✔ Access to Production Grade Projects course</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Start Pro</Button>
        </CardFooter>
      </Card>


    </div>
  )
}
