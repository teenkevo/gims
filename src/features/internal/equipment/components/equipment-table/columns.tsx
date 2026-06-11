"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { format } from "date-fns";
import { TriangleAlert } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import type { ALL_EQUIPMENT_QUERY_RESULT } from "../../../../../../sanity.types";
import { getEquipmentCategoryLabel } from "../../constants";
import { EquipmentStatusBadge } from "../equipment-status-badge";
import { EquipmentTableRowActions } from "./equipment-table-row-actions";

export const getColumns = (): ColumnDef<ALL_EQUIPMENT_QUERY_RESULT[number]>[] => [
  {
    accessorKey: "internalId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Equipment ID" />
    ),
    cell: ({ row }) => (
      <Link className="hover:underline" href={`/equipment/${row.original._id}`}>
        <div className="w-[100px] font-bold">{row.original.internalId}</div>
      </Link>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <Link className="hover:underline" href={`/equipment/${row.original._id}`}>
        <span className="max-w-[250px] truncate font-normal">
          {row.original.name}
        </span>
      </Link>
    ),
    filterFn: (row, _id, value) => {
      const search = String(value).toLowerCase();
      const name = row.original.name?.toLowerCase() ?? "";
      const internalId = row.original.internalId?.toLowerCase() ?? "";
      const serialNumber = row.original.serialNumber?.toLowerCase() ?? "";
      return (
        name.includes(search) ||
        internalId.includes(search) ||
        serialNumber.includes(search)
      );
    },
  },
  {
    accessorKey: "serialNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Serial No." />
    ),
    cell: ({ row }) => (
      <span className="font-normal">{row.original.serialNumber ?? "—"}</span>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => (
      <span className="font-normal">
        {getEquipmentCategoryLabel(row.original.category)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <EquipmentStatusBadge status={row.original.status} />,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "nextMaintenance",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Next Maintenance" />
    ),
    cell: ({ row }) => {
      const due = row.original.nextMaintenance;
      return due ? (
        <Button variant="outline" size="sm">
          {format(new Date(due), "dd/MM/yy")}
        </Button>
      ) : (
        <Button variant="outline" size="sm">
          <TriangleAlert className="text-orange-500 w-4 h-4 mr-2" />
          Not set
        </Button>
      );
    },
  },
  {
    accessorKey: "labs",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Labs" />
    ),
    cell: ({ row }) => (
      <span className="font-normal">{row.original.labs?.length ?? 0}</span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <EquipmentTableRowActions item={row.original} />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
