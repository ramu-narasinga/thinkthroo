"use client"

import { useState } from "react"
import PrivatePageGuard from "@/components/private-page-guard"
import { Button } from "@thinkthroo/ui/components/button"
import { Badge } from "@thinkthroo/ui/components/badge"
import { Card, CardContent } from "@thinkthroo/ui/components/card"
import { Separator } from "@thinkthroo/ui/components/separator"
import { Check } from "lucide-react"
import { DataTable } from "@/components/subscription-table/data-table"
import { columns } from "@/components/subscription-table/columns"
import DeleteOrganizationModal from "@/components/delete-organization-modal"
import posthog from "posthog-js"

export default function BillingPage() {
  const invoices: any[] = []
  const [openDelete, setOpenDelete] = useState(false)

  const handleDeleteAccount = () => {
    posthog.capture("delete_account_clicked", {
      timestamp: new Date().toISOString(),
    })
    setOpenDelete(true)
  }

  return (
    <PrivatePageGuard>
    <>
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2">
          <h1 className="text-2xl font-semibold text-foreground">
            Billing
          </h1>
        </div>

        {/* Plan */}
        <h2 className="text-lg font-semibold">Plan</h2>

        {/* Current Plan */}
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base">Code Quality - Open Source plan</span>
                <Badge variant="outline">Current</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Free</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Users</p>
              <p className="text-base font-medium">1</p>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade to Pro */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base">Upgrade to Pro plan</span>
                  <Badge variant="outline" className="text-foreground border-foreground">
                    Suggested
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">$15 per user/month, billed monthly</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" className="text-sm font-medium">View all plans</Button>
                <Button className="bg-black hover:bg-black/80 text-white">Upgrade now</Button>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-foreground" /><span>Code review for private repos</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-foreground" /><span>Summaries and diagrams of code changes</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-foreground" /><span>Line by line code reviews</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-foreground" /><span>Limited security scans for 10 repos</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-foreground" /><span>Security scans done biweekly</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-foreground" /><span>Custom review rules</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices */}
        <h2 className="text-lg font-semibold">Invoices</h2>
        <DataTable columns={columns} data={invoices} />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteOrganizationModal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
      />
    </>
    </PrivatePageGuard>
  )
}
