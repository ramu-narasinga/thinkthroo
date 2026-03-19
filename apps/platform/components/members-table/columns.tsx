"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@thinkthroo/ui/components/checkbox"
import { Badge } from "@thinkthroo/ui/components/badge"
import { DataTableColumnHeader } from "@/components/data-table-column-header"

export type Member = {
  id: string
  username: string
  avatarUrl?: string
  lastActivity: string
  role: "Admin" | "Member" | "Viewer"
  seatStatus: "Assigned" | "Unassigned"
}

export const columns: ColumnDef<Member>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "username",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Username" />
    ),
    cell: ({ row }) => {
      const avatarUrl: string | undefined = row.original.avatarUrl
      return (
        <div className="flex items-center gap-2">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={row.getValue("username")}
              className="w-7 h-7 rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              {(row.getValue("username") as string)?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="font-medium">{row.getValue("username")}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "lastActivity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Activity" />
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
  },
  {
    accessorKey: "seatStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Seat Status" />
    ),
    cell: ({ row }) => {
      const status: string = row.getValue("seatStatus")
      const isAssigned = status === "Assigned"
      return (
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${isAssigned ? "bg-green-500" : "bg-gray-400"}`}
          />
          <Badge variant="outline" className="font-normal">
            {status}
          </Badge>
        </div>
      )
    },
  },
]
