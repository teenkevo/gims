"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import type {
  ALL_CLIENTS_QUERY_RESULT,
  CLIENT_BY_ID_QUERY_RESULT,
} from "../../../../../../sanity.types";
import Link from "next/link";

const selectColumn: ColumnDef<
  CLIENT_BY_ID_QUERY_RESULT[number]["contacts"][number]
> = {
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
};

// Convert columns to a function that accepts parameters
export const getColumns = ({
  canUpdate,
}: {
  canUpdate: boolean;
}): ColumnDef<CLIENT_BY_ID_QUERY_RESULT[number]["contacts"][number]>[] => [
  ...(canUpdate ? [selectColumn] : []),
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="w-[150px] font-bold">{row.original?.name}</div>
    ),
    // enableSorting: false,
    // enableHiding: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[350px] truncate font-normal">
            {row.original?.email}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone Number" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="font-normal">{row.original?.phone}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "designation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Designation" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[350px] truncate font-normal">
            <span className="font-bold text-primary">
              {row.original?.designation}
            </span>
          </span>
        </div>
      );
    },
  },
  // Allow going to linked projects
  {
    accessorKey: "projects",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Projects" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="font-normal">{row.original?.projects.length}</span>
        </div>
      );
    },
  },

  ...(canUpdate
    ? [
        {
          id: "actions",
          cell: ({ row }) => <DataTableRowActions contact={row.original} />,
        } satisfies ColumnDef<
          CLIENT_BY_ID_QUERY_RESULT[number]["contacts"][number]
        >,
      ]
    : []),
];
