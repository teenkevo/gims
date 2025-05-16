"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import type { ALL_CLIENTS_QUERYResult, CLIENT_BY_ID_QUERYResult } from "../../../../../../sanity.types";
import Link from "next/link";

// Convert columns to a function that accepts parameters
export const getColumns = (): ColumnDef<CLIENT_BY_ID_QUERYResult[number]["contacts"][number]>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <Link className="hover:underline" href={`/clients/${row.original?._id}`}>
        <div className="w-[100px] font-bold">{row.original?.name}</div>
      </Link>
    ),
    // enableSorting: false,
    // enableHiding: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => {
      return (
        <Link className="hover:underline" href={`/clients/${row.original?._id}`}>
          <div className="flex space-x-2">
            <span className="max-w-[350px] truncate font-normal">{row.original?.email}</span>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone Number" />,
    cell: ({ row }) => {
      return (
        <Link className="hover:underline" href={`/clients/${row.original?._id}`}>
          <div className="flex space-x-2">
            <span className="font-normal">{row.original?.phone}</span>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "designation",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Designation" />,
    cell: ({ row }) => {
      return (
        <Link className="hover:underline" href={`/clients/${row.original?._id}`}>
          <div className="flex space-x-2">
            <span className="max-w-[350px] truncate font-normal">
              <span className="font-bold text-primary">{row.original?.designation}</span>
            </span>
          </div>
        </Link>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions clientId={row.original?._id} contact={row.original} />,
  },
];
