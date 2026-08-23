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

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import type { ALL_PROJECTS_QUERY_RESULT } from "../../../../../../sanity.types";
import { getColumns } from "./columns";
import { DeleteMultipleServices } from "./delete-multiple-services";
import { DataTableToolbar } from "./data-table-toolbar";
import { useState } from "react";
import { useRBAC } from "@/components/rbac-context";
import { PERMISSIONS } from "@/lib/auth/permissions";

interface DataTableProps {
  data: ALL_PROJECTS_QUERY_RESULT;
  initialColumnFilters?: ColumnFiltersState;
}

function projectSearchFn(
  row: { original: ALL_PROJECTS_QUERY_RESULT[number] },
  _columnId: string,
  filterValue: unknown
) {
  const query = String(filterValue ?? "")
    .trim()
    .toLowerCase();
  if (!query) return true;

  const project = row.original;
  const haystack = [
    project.name,
    project.internalId,
    ...(project.clients?.map((client) => client?.name) ?? []),
    ...(project.clients?.map((client) => client?.internalId) ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function DataTable({ data, initialColumnFilters = [] }: DataTableProps) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      quotationStatus: false,
      dueStatus: false,
    });
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(initialColumnFilters);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const { can, isClientUser } = useRBAC();
  const canUpdate = can(PERMISSIONS["projects:update"]);
  const canDelete = can(PERMISSIONS["projects:delete"]);

  // Generate columns with the provided props
  // Use propColumns if provided, otherwise generate columns with the function
  const columns = React.useMemo(
    () =>
      getColumns(data, { canUpdate, canDelete, isClientUser }) as ColumnDef<
        ALL_PROJECTS_QUERY_RESULT[number]
      >[],
    [data, canUpdate, canDelete, isClientUser]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    enableRowSelection: canDelete,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: projectSearchFn,
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
      <DataTableToolbar
        table={table}
        onDeleteSelected={canDelete ? () => setOpenDialog(true) : undefined}
      />
      <DeleteMultipleServices
        ids={serviceIds}
        open={openDialog && canDelete}
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
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={header.column.id === "actions" ? "w-[50px]" : undefined}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.id === "actions" ? "w-[50px]" : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No projects.
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
