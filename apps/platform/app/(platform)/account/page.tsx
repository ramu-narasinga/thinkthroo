"use client"

import { useState } from "react"
import PrivatePageGuard from "@/components/private-page-guard"
import { Button } from "@thinkthroo/ui/components/button"
import { Badge } from "@thinkthroo/ui/components/badge"
import { Card, CardContent } from "@thinkthroo/ui/components/card"
import { Separator } from "@thinkthroo/ui/components/separator"
import { Check } from "lucide-react"
import { DataTable as BillingTable } from "@/components/subscription-table/data-table"
import { columns as billingColumns } from "@/components/subscription-table/columns"
import { DataTable as MembersTable } from "@/components/members-table/data-table"
import { columns as memberColumns } from "@/components/members-table/columns"
import type { Member } from "@/components/members-table/columns"
import DeleteOrganizationModal from "@/components/delete-organization-modal"
import { Tabs, TabsList, TabsTrigger } from "@thinkthroo/ui/components/tabs"
import posthog from "posthog-js"

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"billing" | "members">("billing")
  const [openDelete, setOpenDelete] = useState(false)
  const invoices: any[] = []
  const members: Member[] = []

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
            <h1 className="text-2xl font-semibold text-foreground">Account</h1>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "billing" | "members")} className="mb-4">
            <TabsList>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Plan</h2>

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

              <h2 className="text-lg font-semibold">Invoices</h2>
              <BillingTable columns={billingColumns} data={invoices} />
            </div>
          )}

          {/* Members Tab */}
          {activeTab === "members" && (
            <MembersTable columns={memberColumns} data={members} />
          )}
        </div>

        <DeleteOrganizationModal
          open={openDelete}
          onClose={() => setOpenDelete(false)}
        />
      </>
    </PrivatePageGuard>
  )
}
