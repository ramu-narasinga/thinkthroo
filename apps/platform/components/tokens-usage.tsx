"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlanUsageCard } from "@thinkthroo/ui/components/plan-usage-card"

import { useOrganizationStore } from "@/store/organization"
import { organizationSelectors } from "@/store/organization/selectors"
import type { OrganizationItem } from "@/store/organization/initialState"
import { BuyCreditsModal } from "./buy-credits-modal"

const PLAN_CREDIT_MAX: Record<string, number> = {
  free: 50,
  pro: 500,
}

const PLAN_DOC_STORAGE_MB: Record<string, number> = {
  free: 25,
  pro: 250,
}

export function SidebarOptInForm() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const activeOrg = useOrganizationStore(organizationSelectors.activeOrg) as OrganizationItem | undefined
  const creditBalance = Number(activeOrg?.creditBalance ?? "0")
  const planName = activeOrg?.currentPlanName ?? "free"
  const docStorageUsedMB = activeOrg?.docStorageUsedMB ?? 0

  return (
    <>
      <PlanUsageCard
        planName={planName}
        creditBalance={creditBalance}
        creditMax={PLAN_CREDIT_MAX[planName] ?? 50}
        docStorageUsedMB={docStorageUsedMB}
        docStorageMaxMB={PLAN_DOC_STORAGE_MB[planName] ?? 25}
        isPro={planName === "pro"}
        onBuyCredits={() => setOpen(true)}
        onUpgrade={() => router.push("/account/billing")}
      />

      <BuyCreditsModal open={open} onOpenChange={setOpen} />
    </>
  )
}
