"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@thinkthroo/ui/components/dialog"
import { Button } from "@thinkthroo/ui/components/button"
import { Input } from "@thinkthroo/ui/components/input"
import { toast } from "sonner"
import { useOrganizationStore } from "@/store/organization"
import { useUserStore } from "@/store/user"
import { userSelectors } from "@/store/user/selectors"


export function BuyCreditsModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [dollars, setDollars] = useState(25)
  const [loading, setLoading] = useState(false)

  const activeOrgId = useOrganizationStore((s) => s.activeOrgId)
  const userEmail = useUserStore(userSelectors.email)

  const creditsToAdd = dollars * 10
  const productId = process.env.NEXT_PUBLIC_DODO_CREDITS_TOPUP_PRODUCT_ID

  async function handleBuy() {
    if (!productId || !activeOrgId || !userEmail) {
      toast.error("Checkout unavailable — missing configuration")
      return
    }
    if (dollars < 5 || dollars > 100) {
      toast.error("Enter an amount between $5 and $100")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/dodo/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity: dollars,
          organizationId: activeOrgId,
          userEmail,
          type: "topup",
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.checkoutUrl) {
        toast.error("Failed to start checkout")
        setLoading(false)
        return
      }
      window.location.href = data.checkoutUrl
    } catch {
      toast.error("Failed to start checkout")
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl p-6">
        <DialogHeader>
          <DialogTitle>Add credits</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium">Amount (USD)</label>
          <Input
            type="number"
            min={5}
            max={100}
            value={dollars}
            onChange={(e) => setDollars(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            Enter amount between $5 and $100 · You&apos;ll receive {creditsToAdd} credits
          </p>
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Credits</span>
            <span>{creditsToAdd}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${dollars.toFixed(2)}</span>
          </div>
        </div>

        <Button
          className="w-full hover:bg-primary hover:brightness-110 hover:scale-[1.02] transition-all"
          onClick={handleBuy}
          disabled={loading || dollars < 5 || dollars > 100}
        >
          {loading ? "Opening checkout…" : `Buy ${creditsToAdd} credits for $${dollars}`}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          By clicking &quot;Buy credits&quot;, you agree to our Credit Terms
        </p>
      </DialogContent>
    </Dialog>
  )
}
