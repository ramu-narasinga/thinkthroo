"use client";

import { memo } from "react";
import { useState } from "react";
import { useUmami } from "@/hooks/use-umami";
import { Button } from "@thinkthroo/ui/components/button";
import {
  ColumnDef,
  ColumnFiltersState,
  getFilteredRowModel,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@thinkthroo/ui/components/table";

import { Input } from "@thinkthroo/ui/components/input";
import { DataTableViewOptions } from "@/components/data-table-viewoptions";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

const DataTable = memo(
  <TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
      {}
    );
    const [rowSelection, setRowSelection] = useState({});
    const { track } = useUmami();

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
      onColumnFiltersChange: setColumnFilters,
      getFilteredRowModel: getFilteredRowModel(),
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: setRowSelection,
      state: {
        sorting,
        columnFilters,
        columnVisibility,
        rowSelection,
      },
    });

    return (
      <div>
        <div className="flex items-center py-4 gap-4">
          <Input
            placeholder="Search for a repo here..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              table.getColumn("name")?.setFilterValue(value);
              track("repositories_search_input", { query: value });
            }}
            className="max-w-sm"
          />
          <DataTableViewOptions table={table} />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
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
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              track("repositories_pagination_previous");
              table.previousPage();
            }}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              track("repositories_pagination_next");
              table.nextPage();
            }}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }
);

DataTable.displayName = "DataTable";

export default DataTable as <TData, TValue>(
  props: DataTableProps<TData, TValue>
) => JSX.Element;
