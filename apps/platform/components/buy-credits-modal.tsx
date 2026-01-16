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
import { Switch } from "@thinkthroo/ui/components/switch"


export function BuyCreditsModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [credits, setCredits] = useState(25)
  const [autoReload, setAutoReload] = useState(false)

  const tax = +(credits * 0.18).toFixed(2)
  const total = +(credits + tax).toFixed(2)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Add credits</DialogTitle>
            <button onClick={() => onOpenChange(false)}>
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium">Credits</label>
          <Input
            type="number"
            min={5}
            max={100}
            value={credits}
            onChange={(e) => setCredits(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            Enter amount between USD $5 and $100
          </p>
        </div>

        

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${credits.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated taxes</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <Button className="w-full">
          Buy USD ${credits.toFixed(2)} credits
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          By clicking “Buy credits”, you agree to our Credit Terms
        </p>
      </DialogContent>
    </Dialog>
  )
}
