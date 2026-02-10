"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@thinkthroo/ui/components/table"

import { Button } from "@thinkthroo/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@thinkthroo/ui/components/select"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="rounded-lg border">
      {/* TABLE */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="uppercase text-xs font-semibold text-muted-foreground"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-[360px] bg-muted/40 text-center text-muted-foreground"
              >
                No results
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* FOOTER / PAGINATION */}
      <div className="flex items-center justify-end gap-6 px-4 py-3 text-sm text-muted-foreground">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <Select defaultValue="10">
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Page info */}
        <div>
          Page {table.getState().pagination.pageIndex} of{" "}
          {table.getPageCount() || 0}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8">
            {"<<"}
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            {"<"}
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            {">"}
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            {">>"}
          </Button>
        </div>
      </div>
    </div>
  )
}
