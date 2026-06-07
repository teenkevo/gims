"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { ALL_LABS_QUERY_RESULT } from "../../../../../../sanity.types";
import { getLabSectionLabel } from "../../constants";
import { LabStatusBadge } from "../lab-status-badge";
import { LabTableRowActions } from "./lab-table-row-actions";

export const getColumns = (): ColumnDef<ALL_LABS_QUERY_RESULT[number]>[] => [
  {
    accessorKey: "internalId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lab ID" />
    ),
    cell: ({ row }) => (
      <Link className="hover:underline" href={`/labs/${row.original._id}`}>
        <div className="w-[100px] font-bold">{row.original.internalId}</div>
      </Link>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Laboratory" />
    ),
    cell: ({ row }) => (
      <Link className="hover:underline" href={`/labs/${row.original._id}`}>
        <span className="max-w-[300px] truncate font-normal">
          {row.original.name}
        </span>
      </Link>
    ),
  },
  {
    accessorKey: "labSection",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Section" />
    ),
    cell: ({ row }) => (
      <span className="font-normal">
        {getLabSectionLabel(row.original.labSection)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <LabStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "labHead",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lab Head" />
    ),
    cell: ({ row }) => (
      <span className="font-normal">
        {row.original.labHead?.fullName ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "capacity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Capacity" />
    ),
    cell: ({ row }) => (
      <span className="font-normal">
        {row.original.capacity ? `${row.original.capacity} stations` : "—"}
      </span>
    ),
  },
  {
    accessorKey: "projects",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Projects" />
    ),
    cell: ({ row }) => (
      <Link
        className="hover:underline"
        href={`/labs/${row.original._id}?tab=projects`}
      >
        <span className="font-normal">{row.original.projects?.length ?? 0}</span>
      </Link>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <LabTableRowActions lab={row.original} />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
