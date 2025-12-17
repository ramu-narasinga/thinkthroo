"use client"

import { useEffect, useState } from "react"
import { Button } from "@thinkthroo/ui/components/button"
import { Badge } from "@thinkthroo/ui/components/badge"
import { Card, CardContent } from "@thinkthroo/ui/components/card"
import { Trash2, DollarSign, Github, Users } from "lucide-react"
import { DataTable } from "@/components/subscription-table/data-table"
import { getColumns, Payment } from "@/components/subscription-table/columns"

export default function SubscriptionPage() {
  const [data, setData] = useState<Payment[]>([])

  useEffect(() => {
    setData([
     {
  id: "728ed52f",
  amount: 100,
  status: "pending",
  email: "m@example.com",
  latestPR: "feat: new button",
  role: "Developer"
},

      {
        id: "45ad8f91",
        amount: 250,
        status: "success",
        email: "john.doe@example.com",
        latestPR: "Improve dashboard",
        role: "User",
      },
    ])
  }, [])

  const handleDeleteAccount = () => {
    alert("Delete Account Clicked")
  }

  const handleManageSubscription = () => {
    alert("Manage Subscription Clicked")
  }

  const columns = getColumns(setData)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-2xl font-semibold text-foreground">Subscription</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleDeleteAccount}
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleManageSubscription}
          >
            <DollarSign className="w-4 h-4" />
            Manage Subscription
          </Button>
        </div>
      </div>

      {/* Subscription Card */}
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <Github className="w-8 h-8 text-foreground" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-lg">ramu-narasinga</span>
                <Badge
                  variant="outline"
                  className="text-orange-600 border-orange-600 bg-orange-100"
                >
                  Free
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">Active</p>

              <div className="mt-4 flex flex-col gap-1 text-sm text-foreground">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>0/1 seat assigned</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Renewal on Jul 26, 2025</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <div className="pt-4">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  )
}
