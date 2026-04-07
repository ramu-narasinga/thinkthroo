import { type CreditBundle } from "../lib/pricing"

export function CreditBundleGrid({ bundles }: { bundles: CreditBundle[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {bundles.map((bundle) => (
        <div
          key={bundle.dollars}
          className="rounded-lg border border-border p-4 flex flex-col gap-2 items-center text-center"
        >
          <p className="font-semibold text-sm">{bundle.label}</p>
          <p className="text-2xl font-bold">${bundle.dollars}</p>
          <p className="text-xs text-muted-foreground">{bundle.description}</p>
        </div>
      ))}
    </div>
  )
}
