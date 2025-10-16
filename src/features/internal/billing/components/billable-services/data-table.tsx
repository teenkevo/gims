import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
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
import { Toolbar } from "./toolbar";
import { ALL_SERVICES_QUERYResult } from "../../../../../../sanity.types";
import { ExtendedService } from "./columns";
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setSelectedServices: React.Dispatch<
    React.SetStateAction<ALL_SERVICES_QUERYResult>
  >;
  onValidationChange: (isValid: boolean) => void;
}

export function DataTable<TData extends ExtendedService, TValue>({
  columns,
  data,
  setSelectedServices,
  onValidationChange,
}: DataTableProps<TData, TValue>) {
  /* ------------------------------------------------------------- */
  /*  1 ▸ build initial selection from row.preSelected             */
  /* ------------------------------------------------------------- */
  const initialRowSelection = React.useMemo(() => {
    const sel: Record<string, boolean> = {};
    data.forEach((d, idx) => {
      if (d.preSelected) sel[idx] = true;
    });
    return sel;
  }, [data]);

  const [rowSelection, setRowSelection] = React.useState(initialRowSelection);

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

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
    autoResetPageIndex: false,
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

  // Bubble up the selection to the parent component
  React.useEffect(() => {
    const selectedServices = table
      .getSelectedRowModel()
      .flatRows.map((row) => row.original);

    setSelectedServices(selectedServices);

    // Validation: check if all selected lab tests are valid
    const servicesValid =
      selectedServices.length > 0
        ? selectedServices.every(
            (t: ExtendedService) =>
              // require unit
              Boolean(t.unit && String(t.unit).trim().length > 0) &&
              // require price and quantity
              Boolean(t.price && t.price > 0 && t.quantity && t.quantity > 0) &&
              // require a selected test method
              t.testMethods?.some(
                (tm) => (tm as { selected?: boolean }).selected
              )
          )
        : false;

    // Trigger validation state change
    onValidationChange(servicesValid);
  }, [table.getSelectedRowModel()]);

  return (
    <div className="p-4 space-y-4">
      <Toolbar table={table} />
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
                  No results.
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
