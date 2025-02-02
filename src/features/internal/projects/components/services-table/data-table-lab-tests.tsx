"use client";

import * as React from "react";
import { z } from "zod";
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

import { DataTableLabTestsToolbar } from "./data-table-lab-tests-toolbar";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  Service,
  serviceSchema,
} from "@/features/customer/services/data/schema";
import data from "@/features/customer/services/data/services.json";
import { columns as getColumns } from "./columns";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  sample_classes,
  test_methods,
} from "@/features/customer/services/data/data";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Price } from "./price";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DataTableLabTestsProps {
  coreLabRowSelection: {};
  labTestsTableData: Service[];
  setSelectedLabTests: React.Dispatch<React.SetStateAction<Service[]>>;
  setLabTestsTableData: React.Dispatch<React.SetStateAction<Service[]>>;
  setCoreLabRowSelection: React.Dispatch<React.SetStateAction<{}>>;
  onValidationChange: (isValid: boolean) => void; // New prop
}

export function DataTableLabTests({
  coreLabRowSelection,
  labTestsTableData,
  setSelectedLabTests,
  setLabTestsTableData,
  setCoreLabRowSelection,
  onValidationChange,
}: DataTableLabTestsProps) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns: ColumnDef<Service>[] = React.useMemo(
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
        accessorKey: "test_method",
        header: ({ column }) => (
          <DataTableColumnHeader
            className="text-sm"
            column={column}
            title="Test Method"
          />
        ),
        cell: ({ row }) => {
          const test_methods_to_check = row.original.test_methods.map(
            (m) => m.label
          );
          const filtered_test_methods = test_methods.filter((test_method) =>
            test_methods_to_check.includes(test_method.label)
          );

          const isATestMethodSelected = row.original.test_methods.some(
            (m) => m.selected
          );

          const selectedTestMethod = row.original.test_methods.find(
            (m) => m.selected
          );

          return (
            <div className="space-x-2">
              <ToggleGroup
                type="single"
                variant="outline"
                defaultValue={selectedTestMethod?.value}
                disabled={!row.getIsSelected()} // disable toggle selection if row is not selected
                onValueChange={(value) => {
                  setLabTestsTableData((prevData) =>
                    prevData.map((item) =>
                      item.id === row.original.id
                        ? {
                            ...item,
                            test_methods: row.original.test_methods.map(
                              (method) =>
                                method.value === value
                                  ? { ...method, selected: true }
                                  : { ...method, selected: false }
                            ),
                          }
                        : item
                    )
                  );
                }}
              >
                {filtered_test_methods.map((tm) => (
                  <ToggleGroupItem key={tm.value} value={tm.value}>
                    {tm.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              {row.getIsSelected() && !isATestMethodSelected && (
                <p className="text-destructive text-xs mt-2 font-medium">
                  Choose a method
                </p>
              )}
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
          const sample_class = sample_classes.find(
            (sample_class) =>
              sample_class.value === row.getValue("sample_class")
          );

          if (!sample_class) {
            return null;
          }

          return (
            <div className="flex w-[100px] items-center">
              <span>{sample_class.label}</span>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
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
        cell: ({ row }) => {
          return (
            <Price
              initialValues={{
                price: row.original.price,
                quantity: row.original.quantity,
              }}
              onPriceChange={(price) => {
                setLabTestsTableData((prevData) =>
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
                setLabTestsTableData((prevData) =>
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
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: labTestsTableData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection: coreLabRowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setCoreLabRowSelection,
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
    const selectedLabTests = table
      .getSelectedRowModel()
      .flatRows.map((row) => row.original);

    setSelectedLabTests(selectedLabTests);

    // Validation: check if all selected lab tests are valid
    const labTestsValid =
      selectedLabTests.length > 0
        ? selectedLabTests.every(
            (t) =>
              t.price &&
              t.price > 0 &&
              t.quantity &&
              t.quantity > 0 &&
              t.test_methods.some((tm) => tm.selected)
          )
        : false;

    // Trigger validation state change
    onValidationChange(labTestsValid);
  }, [table.getSelectedRowModel()]);

  return (
    <div className="p-4">
      <DataTableLabTestsToolbar table={table} />
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
