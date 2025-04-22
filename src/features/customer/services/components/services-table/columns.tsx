"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { v4 as uuidv4 } from "uuid";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import type {
  ALL_SERVICES_QUERYResult,
  ALL_STANDARDS_QUERYResult,
  ALL_SAMPLE_CLASSES_QUERYResult,
  ALL_TEST_METHODS_QUERYResult,
} from "../../../../../../sanity.types";
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import Link from "next/link";

// Convert columns to a function that accepts parameters
export const getColumns = (
  standards?: ALL_STANDARDS_QUERYResult,
  sampleClasses?: ALL_SAMPLE_CLASSES_QUERYResult,
  testMethods?: ALL_TEST_METHODS_QUERYResult
): ColumnDef<ALL_SERVICES_QUERYResult[number]>[] => [
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
      <Link className="hover:underline" href={`/services/${row.original?._id}`}>
        <div className="w-[80px] font-bold">{row.getValue("code")}</div>
      </Link>
    ),
    // enableSorting: false,
    // enableHiding: false,
  },
  {
    accessorKey: "test_parameter",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Test Parameter" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          className="hover:underline"
          href={`/services/${row.original?._id}`}
        >
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-normal">
              {row.original?.testParameter}
            </span>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "test_method",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Test Method" />
    ),
    cell: ({ row }) => {
      // Now you can use testMethods here if needed
      return (
        <div className="flex space-x-2">
          {row.original?.testMethods?.map((method) => (
            <Link
              key={uuidv4()}
              className="hover:underline"
              href={`/services/test-methods/${method._id}`}
            >
              <Badge variant="outline">{method.standard?.acronym}</Badge>
            </Link>
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
      // Now you can use sampleClasses here if needed
      return (
        <div className="flex w-[100px] items-center">
          <span>{row.original?.sampleClass?.name}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(
        row.original?.sampleClass?.name?.toLowerCase().replace(/\s+/g, "") || ""
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          {row.original?.status === "active" && (
            <Badge variant="outline">
              <CheckCircledIcon className="mr-2 h-4 w-4 text-primary" />
              Active
            </Badge>
          )}
          {row.original?.status === "inactive" && (
            <Badge variant="outline">
              <CrossCircledIcon className="mr-2 h-4 w-4 text-orange-500" />
              Inactive
            </Badge>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions
        sampleClasses={sampleClasses || []}
        testMethods={testMethods || []}
        service={row.original as ALL_SERVICES_QUERYResult[number]}
      />
    ),
  },
];
