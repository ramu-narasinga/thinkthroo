"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlanUsageCard } from "@thinkthroo/ui/components/plan-usage-card"

import { useOrganizationStore } from "@/store/organization"
import { organizationSelectors } from "@/store/organization/selectors"
import { PLAN_CREDIT_MAX, PLAN_DOC_STORAGE_MB } from "@/const/pricing"
import { BuyCreditsModal } from "./buy-credits-modal"

export function SidebarOptInForm() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const activeOrg = useOrganizationStore(organizationSelectors.activeOrg)
  const creditBalance = useOrganizationStore(organizationSelectors.creditBalance)
  const planName = useOrganizationStore(organizationSelectors.currentPlanName)
  const isPro = useOrganizationStore(organizationSelectors.isPro)
  const docStorageUsedMB = activeOrg?.docStorageUsedMB ?? 0

  return (
    <>
      <PlanUsageCard
        planName={planName}
        creditBalance={creditBalance}
        creditMax={PLAN_CREDIT_MAX[planName] ?? 50}
        docStorageUsedMB={docStorageUsedMB}
        docStorageMaxMB={PLAN_DOC_STORAGE_MB[planName] ?? 25}
        isPro={isPro}
        onBuyCredits={() => setOpen(true)}
        onUpgrade={() => router.push("/account/billing")}
      />

      <BuyCreditsModal open={open} onOpenChange={setOpen} />
    </>
  )
}
