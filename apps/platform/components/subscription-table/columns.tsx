"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-table-column-header"

export type Invoice = {
  orderId: string
  dueDate: string
  paidOn: string
  plan: string
  seats: number
  total: string
}

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "orderId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order ID" />
    ),
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due Date" />
    ),
  },
  {
    accessorKey: "paidOn",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Paid On" />
    ),
  },
  {
    accessorKey: "plan",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Plan" />
    ),
  },
  {
    accessorKey: "seats",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Seats" />
    ),
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Total" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {row.getValue("total")}
      </div>
    ),
  },
]
