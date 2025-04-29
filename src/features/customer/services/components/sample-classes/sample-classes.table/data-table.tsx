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

import { DataTableToolbar } from "./data-table-toolbar";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { getColumns } from "./columns"; // Import the function instead of the constant
import { ALL_SAMPLE_CLASSES_QUERYResult } from "../../../../../../../sanity.types";
import { DeleteMultipleSampleClasses } from "./delete-multiple-sample-classes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getDocumentsReferencingMultipleSampleClasses,
  getDocumentsReferencingSampleClass,
} from "@/lib/actions";

interface DataTableProps<TData, TValue> {
  data: TData[];
  sampleClasses: ALL_SAMPLE_CLASSES_QUERYResult;
}

export function DataTable<TData, TValue>({
  data,
  sampleClasses,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [openDialog, setOpenDialog] = React.useState<boolean>(false);

  const [referencingDocs, setReferencingDocs] = React.useState<
    { sampleClassId: string; documents: any[] }[]
  >([]);

  // Generate columns with the provided props

  const columns = React.useMemo(
    () => getColumns(sampleClasses) as ColumnDef<TData, TValue>[],
    [data]
  );

  const table = useReactTable({
    data,
    columns: columns as ColumnDef<TData, TValue>[],
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

  const sampleClassIds = table
    .getSelectedRowModel()
    .rows.map((row) => (row.original as { _id: string })._id);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 items-center py-4">
        <Input
          placeholder="Filter sample classes by name"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[250px] lg:w-[250px]"
        />
        {table.getSelectedRowModel().rows.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              onClick={async () => {
                const docs =
                  await getDocumentsReferencingMultipleSampleClasses(
                    sampleClassIds
                  );
                setReferencingDocs(docs);
                setOpenDialog(true);
              }}
              size="sm"
              className="h-8"
            >
              Delete {table.getSelectedRowModel().rows.length} selected
            </Button>
            <span className="text-sm text-muted-foreground">
              {table.getSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </span>
          </div>
        )}
        <DeleteMultipleSampleClasses
          sampleClasses={sampleClasses}
          ids={sampleClassIds}
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          referencingDocs={referencingDocs}
        />
      </div>
      <div className="rounded-md border mb-2">
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
