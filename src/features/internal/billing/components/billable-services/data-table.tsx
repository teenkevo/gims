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
import {
  ALL_SERVICES_QUERYResult,
  PROJECT_BY_ID_QUERYResult,
} from "../../../../../../sanity.types";
import { ExtendedService } from "./columns";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  quotation?: PROJECT_BY_ID_QUERYResult[number]["quotation"];
  setSelectedServices: React.Dispatch<
    React.SetStateAction<ALL_SERVICES_QUERYResult>
  >;
  onValidationChange: (isValid: boolean) => void;
}

export function DataTable<
  TData extends ALL_SERVICES_QUERYResult[number],
  TValue,
>({
  columns,
  data,
  quotation,
  setSelectedServices,
  onValidationChange,
}: DataTableProps<TData, TValue>) {
  const [tableData, setTableData] = React.useState(data);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  React.useEffect(() => {
    if (quotation && quotation.items) {
      const itemMap = Object.fromEntries(
        quotation.items.map((item) => [item.service?._ref, item])
      );
      const updatedData = data.map((row) => {
        const item = itemMap[row._id];
        return item
          ? {
              ...row,
              price: item.unitPrice,
              quantity: item.quantity,
            }
          : row;
      });
      setTableData(updatedData);

      const selection: Record<string, boolean> = {};
      updatedData.forEach((row, idx) => {
        if (itemMap[row._id]) selection[idx] = true;
      });
      setRowSelection(selection);
    } else {
      setTableData(data);
      setRowSelection({});
    }
  }, [quotation, data]);

  const table = useReactTable({
    data: tableData,
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

  const tableRows = table.getRowModel().flatRows.map((row) => row.original);
  const selectedTableRows = table
    .getSelectedRowModel()
    .flatRows.map((row) => row.original);

  console.log(selectedTableRows);

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
              t.price &&
              t.price > 0 &&
              t.quantity &&
              t.quantity > 0 &&
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
