"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@thinkthroo/ui/components/dialog"
import { Button } from "@thinkthroo/ui/components/button"
import { toast } from "sonner"
import { useOrganizationStore } from "@/store/organization"
import { organizationSelectors } from "@/store/organization/selectors"

export function DowngradeModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [downgrading, setDowngrading] = useState(false)

  const activeOrgId = useOrganizationStore(organizationSelectors.activeOrgId)
  const cancelSubscription = useOrganizationStore((s) => s.cancelSubscription)

  async function handleConfirm() {
    if (!activeOrgId) return
    setDowngrading(true)
    try {
      const result = await cancelSubscription(activeOrgId)
      const dateStr = result?.effectiveAt
        ? new Date(result.effectiveAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "end of billing period"
      toast.success(`Subscription cancelled. You'll stay on Pro until ${dateStr}.`)
      onOpenChange(false)
    } catch {
      toast.error("Failed to cancel subscription. Please try again.")
    } finally {
      setDowngrading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl p-6">
        <DialogHeader>
          <DialogTitle>Downgrade to Free?</DialogTitle>
          <DialogDescription>
            Your Pro access will continue until the end of your current billing period. After that,
            your account will be moved to the Free plan and unused credits will not be refunded.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={downgrading}
          >
            Keep Pro
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleConfirm}
            disabled={downgrading}
          >
            {downgrading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Confirm downgrade"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
