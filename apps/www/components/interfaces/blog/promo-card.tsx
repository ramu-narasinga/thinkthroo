import { Card, CardContent } from "@thinkthroo/ui/components/card"
import { Button } from "@thinkthroo/ui/components/button"

export function PromoCard() {
  return (
    <Card className="rounded-lg bg-muted/30">
      <CardContent className="p-6 space-y-4">
        <h4 className="text-lg font-semibold leading-tight">
          Get 10% off Think Throo
        </h4>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Trusted by OpenAI, Sonos, Adobe and more.  
          Use this promo code when signing up.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <code className="rounded-md bg-muted px-3 py-1.5 text-sm font-mono">
            THINKBLOG10
          </code>

          <Button
            size="sm"
            onClick={() => navigator.clipboard.writeText("THINKBLOG10")}
          >
            Copy
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
