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
import { usePaddle } from "@/hooks/usePaddle"
import { useOrganizationStore } from "@/store/organization"
import { organizationClientService } from "@/service/organization"
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
  const fetchOrganizations = useOrganizationStore((s) => s.fetchOrganizations)
  const userEmail = useUserStore(userSelectors.email)

  const paddle = usePaddle(
    async (data) => {
      const customerId = (data as any)?.customer?.id
      if (customerId && activeOrgId) {
        await organizationClientService.setPaddleCustomerId(activeOrgId, customerId)
      }
      await fetchOrganizations()
      toast.success(`${dollars * 10} credits added to your account!`)
      setLoading(false)
      onOpenChange(false)
    },
    () => setLoading(false),
  )

  const priceId = process.env.NEXT_PUBLIC_PADDLE_CREDITS_TOPUP_PRICE_ID
  const creditsToAdd = dollars * 10

  function handleBuy() {
    if (!paddle || !priceId || !activeOrgId) {
      toast.error("Checkout unavailable — missing configuration")
      return
    }
    if (dollars < 5 || dollars > 100) {
      toast.error("Enter an amount between $5 and $100")
      return
    }
    setLoading(true)
    try {
      paddle.Checkout.open({
        items: [{ priceId, quantity: dollars }],
        customer: userEmail ? { email: userEmail } : undefined,
        customData: { organizationId: activeOrgId },
        settings: { displayMode: "overlay", theme: "light", locale: "en" },
      })
    } catch {
      toast.error("Failed to open checkout")
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
          disabled={!paddle || loading || dollars < 5 || dollars > 100}
        >
          {!paddle ? "Initializing…" : loading ? "Opening checkout…" : `Buy ${creditsToAdd} credits for $${dollars}`}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          By clicking &quot;Buy credits&quot;, you agree to our Credit Terms
        </p>
      </DialogContent>
    </Dialog>
  )
}
