"use client"

import { useState } from "react"
import { Button } from "@thinkthroo/ui/components/button"
import { toast } from "sonner"

interface BuyLicenseButtonProps {
  orgId: string
  email: string
  disabled?: boolean
}

export function BuyLicenseButton({ orgId, email, disabled }: BuyLicenseButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    const productId = process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID
    if (!productId) {
      toast.error("Checkout unavailable — missing product configuration")
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/dodo/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          organizationId: orgId,
          userEmail: email,
          type: 'license',
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
    <Button
      className="w-full font-semibold bg-[#7000FF] text-white hover:bg-[#7000FF]/90 hover:brightness-110 cursor-pointer"
      disabled={loading || disabled}
      onClick={handleClick}
    >
      {loading ? "Opening checkout…" : "Buy license — $49 / year"}
    </Button>
  )
}
