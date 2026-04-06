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

import { useOrganizationStore } from "@/store/organization"
import { organizationSelectors } from "@/store/organization/selectors"
import type { OrganizationItem } from "@/store/organization/initialState"
import { BuyCreditsModal } from "./buy-credits-modal" // ✅ ADD

const PLAN_MAX_CREDITS: Record<string, number> = {
  free: 10,
  pro: 500,
}

export function SidebarOptInForm() {
  const [open, setOpen] = useState(false) // ✅ ADD

  const activeOrg = useOrganizationStore(organizationSelectors.activeOrg) as OrganizationItem | undefined
  const creditBalance = Number(activeOrg?.creditBalance ?? "0")
  const planName = activeOrg?.currentPlanName ?? "free"
  const planMax = PLAN_MAX_CREDITS[planName] ?? 10
  // Progress shows remaining credits as a fraction of the plan max (capped at 100%)
  const progressPercent = Math.min(100, (creditBalance / Math.max(planMax, creditBalance)) * 100)

  return (
    <>
      <Card className="gap-2 py-4 shadow-none">
        <CardHeader className="px-4">
          <CardTitle className="text-sm">Current Plan: {planName.charAt(0).toUpperCase() + planName.slice(1)}</CardTitle>
          <CardDescription>
            {creditBalance.toLocaleString()} credits remaining
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
                className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary hover:brightness-110 hover:scale-[1.02] transition-all w-full shadow-none"
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
