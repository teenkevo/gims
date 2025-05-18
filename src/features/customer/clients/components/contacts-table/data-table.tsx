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
import type { CLIENT_BY_ID_QUERYResult } from "../../../../../../sanity.types";
import { getColumns } from "./columns"; // Import the function instead of the constant
import { DataTableToolbar } from "./data-table-toolbar";
import { DeleteMultipleContacts } from "./delete-multiple-contacts";
import { toast } from "sonner";

interface DataTableProps<TData, TValue> {
  data: CLIENT_BY_ID_QUERYResult[number]["contacts"];
}

export function DataTable<TData, TValue>({ data }: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [openDialog, setOpenDialog] = React.useState<boolean>(false);

  // Generate columns with the provided props
  // Use propColumns if provided, otherwise generate columns with the function
  const columns = React.useMemo(
    () => getColumns() as ColumnDef<CLIENT_BY_ID_QUERYResult[number]["contacts"][number]>[],
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

  const selectedContacts = table.getFilteredSelectedRowModel().rows.map((row) => row.original);

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        openDialog={() => {
          const contactsNotInProjects = selectedContacts.filter(
            (contact) => contact.projects.length === 0
          );
          if (contactsNotInProjects.length > 0) {
            setOpenDialog(true);
          } else {
            toast.warning(
              selectedContacts.length > 1
                ? "These contacts are used in 1 or more projects and cannot be deleted."
                : "This contact is used in 1 or more projects and cannot be deleted."
            );
          }
        }}
      />
      <DeleteMultipleContacts
        contacts={selectedContacts}
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
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No contacts.
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
