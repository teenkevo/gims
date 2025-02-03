"use client";

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
import { FieldService } from "@/features/customer/services/data/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Price } from "./price";
import { DataTableFieldToolbar } from "./data-table-field_toolbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DataTableFieldTestsProps {
  coreFieldRowSelection: {};
  fieldTestsTableData: FieldService[];
  setSelectedFieldTests: React.Dispatch<React.SetStateAction<FieldService[]>>;
  setFieldTestsTableData: React.Dispatch<React.SetStateAction<FieldService[]>>;
  setCoreFieldRowSelection: React.Dispatch<React.SetStateAction<{}>>;
  onValidationChange: (isValid: boolean) => void; // New prop
}

export function DataTableFieldTests({
  coreFieldRowSelection,
  fieldTestsTableData,
  setSelectedFieldTests,
  setFieldTestsTableData,
  setCoreFieldRowSelection,
  onValidationChange,
}: DataTableFieldTestsProps) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns: ColumnDef<FieldService>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "code",
        header: ({ column }) => (
          <DataTableColumnHeader
            className="text-sm"
            column={column}
            title="Code"
          />
        ),
        cell: ({ row }) => (
          <div className="w-[40px] font-bold">{row.getValue("code")}</div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "test_parameter",
        header: ({ column }) => (
          <DataTableColumnHeader
            className="text-sm"
            column={column}
            title="Test Parameter"
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex space-x-2">
              <span className="max-w-[300px] truncate font-normal">
                {row.getValue("test_parameter")}
              </span>
            </div>
          );
        },
      },

      {
        accessorKey: "sample_class",
        header: ({ column }) => (
          <DataTableColumnHeader
            className="text-sm"
            column={column}
            title="Sample Class"
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex w-[100px] items-center">
              <span>Field</span>
            </div>
          );
        },
      },
      {
        id: "price",
        header: ({ column }) => (
          <DataTableColumnHeader
            className="text-sm"
            column={column}
            title="Unit Price - Quantity - Total"
          />
        ),
        cell: ({ row }) => (
          <Price
            initialValues={{
              price: row.original.price,
              quantity: row.original.quantity,
            }}
            onPriceChange={(price) => {
              setFieldTestsTableData((prevData) =>
                prevData.map((item) =>
                  item.id === row.original.id
                    ? {
                        ...item,
                        price,
                      }
                    : item
                )
              );
            }}
            onQuantityChange={(quantity) => {
              setFieldTestsTableData((prevData) =>
                prevData.map((item) =>
                  item.id === row.original.id
                    ? {
                        ...item,
                        quantity,
                      }
                    : item
                )
              );
            }}
            isRowSelected={row.getIsSelected()}
            onSubmit={() => null}
          />
        ),
      },
    ],
    [setFieldTestsTableData]
  );

  const table = useReactTable({
    data: fieldTestsTableData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection: coreFieldRowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setCoreFieldRowSelection,
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
    const selectedFieldTests = table
      .getSelectedRowModel()
      .flatRows.map((row) => row.original);

    setSelectedFieldTests(selectedFieldTests);

    // Validation: check if all selected lab tests are valid
    const fieldTestsValid =
      selectedFieldTests.length > 0
        ? selectedFieldTests.every(
            (t) => t.price && t.price > 0 && t.quantity && t.quantity > 0
          )
        : false;

    // Trigger validation state change
    onValidationChange(fieldTestsValid);
  }, [
    table.getSelectedRowModel(),
    onValidationChange,
    setSelectedFieldTests,
    table,
  ]);

  return (
    <div className="p-4">
      <DataTableFieldToolbar table={table} />
      <div className="rounded-md my-5 border">
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
