"use client"

import PrivatePageGuard from "@/components/private-page-guard"
import { DataTable } from "@/components/members-table/data-table"
import { columns } from "@/components/members-table/columns"
import type { Member } from "@/components/members-table/columns"

const members: Member[] = []

export default function MembersPage() {
  return (
    <PrivatePageGuard>
      <div className="p-6">
        <DataTable columns={columns} data={members} />
      </div>
    </PrivatePageGuard>
  )
}
