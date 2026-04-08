import { type PricingFeature } from "../lib/pricing"

export function PricingFeatureList({
  features,
  iconColor = "text-muted-foreground",
}: {
  features: PricingFeature[]
  iconColor?: string
}) {
  return (
    <ul className="space-y-3">
      {features.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-start gap-2 text-sm">
          <Icon className={`w-4 h-4 ${iconColor} mt-0.5 shrink-0`} />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  )
}
