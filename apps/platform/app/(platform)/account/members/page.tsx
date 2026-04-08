"use client"

import { useEffect, useState } from "react"
import PrivatePageGuard from "@/components/private-page-guard"
import { DataTable } from "@/components/members-table/data-table"
import { columns } from "@/components/members-table/columns"
import type { Member } from "@/components/members-table/columns"
import { inviteClientService } from "@/service/invite"

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])

  useEffect(() => {
    inviteClientService.getAll().then((invitations) => {
      setMembers(
        invitations.map((inv) => ({
          id: inv.id,
          username: inv.fullName,
          lastActivity: inv.createdAt
            ? new Date(inv.createdAt).toLocaleDateString()
            : "—",
          role: "Member",
          seatStatus: "Assigned",
        }))
      )
    })
  }, [])

  return (
    <PrivatePageGuard>
      <div className="p-6">
        <DataTable columns={columns} data={members} />
      </div>
    </PrivatePageGuard>
  )
}
