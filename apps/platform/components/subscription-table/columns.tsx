"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@thinkthroo/ui/components/checkbox"
import { Switch } from "@thinkthroo/ui/components/switch"
import { DataTableColumnHeader } from "@/components/data-table-column-header"

export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
  latestPR: string
  role: string
}

export function getColumns(
  setData: React.Dispatch<React.SetStateAction<Payment[]>>
): ColumnDef<Payment>[] {
  return [
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

    // ✅ Username column
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="email" />
      ),
    },

    // ✅ Latest PR column
    {
      accessorKey: "latestPR",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Latest codearc PR" />
      ),
    },

    // ✅ Role column
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
    },

    // ✅ Seat Status Switch
    {
      id: "seatStatus",
      header: "Seat Status",
      cell: ({ row }) => {
        const payment = row.original
        const isEnabled = payment.status === "success"

        return (
          <Switch
            checked={isEnabled}
            onCheckedChange={(checked) => {
              setData((prev) =>
                prev.map((item) =>
                  item.id === payment.id
                    ? { ...item, status: checked ? "success" : "pending" }
                    : item
                )
              )
            }}
          />
        )
      },
    },
  ]
}
