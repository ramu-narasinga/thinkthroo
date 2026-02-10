"use client"

import { useState } from "react"
import { Button } from "@thinkthroo/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@thinkthroo/ui/components/card"
import { Progress } from "@thinkthroo/ui/components/progress"

import { BuyCreditsModal } from "./buy-credits-modal" // ✅ ADD

export function SidebarOptInForm() {
  const [open, setOpen] = useState(false) // ✅ ADD

  // Example usage numbers
  const usedTokens = 20000
  const totalTokens = 25000
  const progressPercent = (usedTokens / totalTokens) * 100

  return (
    <>
      <Card className="gap-2 py-4 shadow-none">
        <CardHeader className="px-4">
          <CardTitle className="text-sm">Current Plan: Free</CardTitle>
          <CardDescription>
            {usedTokens.toLocaleString()} of {totalTokens.toLocaleString()} tokens used
          </CardDescription>

          {/* Progress Bar */}
          <div className="mt-2">
            <Progress value={progressPercent} />
          </div>
        </CardHeader>

        <CardContent className="px-4">
          <form>
            <div className="grid gap-2.5">
              <Button
                className="cursor-pointer bg-sidebar-primary text-sidebar-primary-foreground w-full shadow-none"
                size="sm"
                onClick={() => setOpen(true)} // ✅ ADD
                type="button"
              >
                Buy Credits
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ✅ MODAL */}
      <BuyCreditsModal open={open} onOpenChange={setOpen} />
    </>
  )
}
