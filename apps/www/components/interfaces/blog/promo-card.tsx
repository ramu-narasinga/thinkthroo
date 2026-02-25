import { Card, CardContent } from "@thinkthroo/ui/components/card"
import { Button } from "@thinkthroo/ui/components/button"

export function PromoCard() {
  return (
    <Card className="rounded-lg bg-muted/30 py-0">
      <CardContent className="p-4 space-x-2 space-y-2">
        <h4 className="text-lg font-semibold leading-tight">
          Your PR Reviews Are Missing Architecture Violations
        </h4>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Think Throo catches violations in every PR using AI + your architecture rules.</p>

        <div className="flex items-center gap-3 pt-2">

          <Button className="cursor-pointer"
            size="sm"
            onClick={() =>
              window.open(
                "https://app.thinkthroo.com/repositories",
                "_blank",
                "noopener,noreferrer"
              )
            }

          >
            Install Think Throo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
