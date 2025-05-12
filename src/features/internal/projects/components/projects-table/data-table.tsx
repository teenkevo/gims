"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
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
} from "@/components/ui/table";

import { DataTableToolbar } from "@/features/customer/services/components/services-table/data-table-toolbar";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import type {
  ALL_PROJECTS_QUERYResult,
  ALL_SERVICES_QUERYResult,
  ALL_TEST_METHODS_QUERYResult,
} from "../../../../../../sanity.types";
import type { ALL_SAMPLE_CLASSES_QUERYResult } from "../../../../../../sanity.types";
import type { ALL_STANDARDS_QUERYResult } from "../../../../../../sanity.types";
import { getColumns } from "./columns"; // Import the function instead of the constant
import { deleteMultipleServices } from "@/lib/actions";
import { DeleteMultipleServices } from "./delete-multiple-services";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DataTableProps<TData, TValue> {
  data: ALL_PROJECTS_QUERYResult;
}

export function DataTable<TData, TValue>({
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [openDialog, setOpenDialog] = useState<boolean>(false);

  // Generate columns with the provided props
  // Use propColumns if provided, otherwise generate columns with the function
  const columns = React.useMemo(
    () => getColumns(data) as ColumnDef<ALL_PROJECTS_QUERYResult[number]>[],
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const serviceIds = table
    .getSelectedRowModel()
    .rows.map((row) => (row.original as { _id: string })._id);

  return (
    <div className="space-y-4">
      {/* <DataTableToolbar
        table={table}
        sampleClasses={sampleClasses}
        openDialog={() => setOpenDialog(true)}
      /> */}
      <DeleteMultipleServices
        ids={serviceIds}
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      />
      {/* <Button onClick={handleDelete}>Delete Selected</Button> */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
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
                  No services.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
