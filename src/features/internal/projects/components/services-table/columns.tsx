"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

import {
  test_methods,
  sample_classes,
} from "@/features/customer/services/data/data";
import { Service } from "@/features/customer/services/data/schema";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Price } from "./price";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const columns: ColumnDef<Service>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
      <DataTableColumnHeader className="text-sm" column={column} title="Code" />
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

      return (
        <div className="flex space-x-2">
          <ToggleGroup type="single" defaultValue="s" variant="outline">
            {filtered_test_methods.map((tm) => (
              <ToggleGroupItem key={tm.value} value={tm.value}>
                {tm.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
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
        (sample_class) => sample_class.value === row.getValue("sample_class")
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
    cell: ({ row }) => (
      <Price
        initialValues={{
          price: undefined,
          quantity: undefined,
        }}
        onPriceChange={() => null}
        onQuantityChange={() => null}
        isRowSelected
        onSubmit={() => null}
      />
    ),
  },
];
