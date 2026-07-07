import { Button } from "@thinkthroo/ui/components/button"
import { Separator } from "@thinkthroo/ui/components/separator"
import Link from "next/link"
import { PricingPlanGrid } from "./pricing-plan-grid"

export default function PricingPage() {
  return (
    <main className="container mx-auto px-4 py-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h1 className="text-4xl font-bold tracking-tight">
          Simple pricing. Bring your own AI.
        </h1>
        <p className="text-muted-foreground mt-4">
          One annual fee covers the platform — updates, bug fixes, and support. Your Claude API costs go directly to Anthropic. We never mark them up.
        </p>
      </div>

      {/* Plan Grid */}
      <PricingPlanGrid />

      {/* AI cost callout */}
      <div className="max-w-2xl mx-auto mt-10 text-center">
        <p className="text-sm text-muted-foreground">
          You pay Anthropic directly for Claude API usage. Think Throo never touches your AI costs.
        </p>
      </div>

      <Separator className="my-20" />

      {/* FAQ teaser */}
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold">Questions?</h2>
        <p className="text-muted-foreground mt-2">
          Need a custom plan or have security questions?
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    </main>
  )
}
