"use client";

import { ColumnDef } from "@tanstack/react-table";
import { v4 as uuidv4 } from "uuid";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { test_methods, statuses, sample_classes } from "../../data/data";
import { Service } from "../../data/schema";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";

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
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px] font-bold">{row.getValue("code")}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "test_parameter",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Test Parameter" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-normal">
            {row.getValue("test_parameter")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "test_method",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Test Method" />
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
          {filtered_test_methods.map((method) => (
            <Badge key={uuidv4()} variant="outline">
              {method.label}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "sample_class",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sample Class" />
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
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      );

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && <status.icon className="mr-2 h-4 w-4 text-primary" />}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
