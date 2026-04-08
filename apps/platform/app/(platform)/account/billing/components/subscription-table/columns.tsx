"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { Badge } from "@thinkthroo/ui/components/badge"
import { ExternalLink } from "lucide-react"
import type { InvoiceItem } from "@/store/organization/initialState"

export type Invoice = InvoiceItem

function formatAmount(total: string, currency: string) {
  const cents = parseInt(total, 10)
  if (isNaN(cents)) return total
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100)
}

function formatDate(iso: string) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Transaction ID" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">{row.getValue("id")}</span>
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => formatDate(row.getValue("date")),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status: string = row.getValue("status")
      return (
        <Badge variant={status === "completed" ? "default" : "outline"} className="capitalize">
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Amount" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatAmount(row.getValue("total"), row.original.currency)}
      </div>
    ),
  },
  {
    id: "invoice",
    header: () => <span className="sr-only">Invoice</span>,
    cell: ({ row }) =>
      row.original.invoiceUrl ? (
        <a
          href={row.original.invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-[#7000FF] hover:underline"
        >
          View <ExternalLink className="h-3 w-3" />
        </a>
      ) : null,
  },
]
