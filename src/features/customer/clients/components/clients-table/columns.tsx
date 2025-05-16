"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import type {
  ALL_SERVICES_QUERYResult,
  ALL_PROJECTS_QUERYResult,
  Quotation,
  ALL_CLIENTS_QUERYResult,
} from "../../../../../../sanity.types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  CheckCircle,
  DollarSign,
  ListEnd,
  ListStart,
  ReceiptText,
  Send,
  XCircle,
  CreditCard,
  FileIcon as FileInvoice,
  CircleDashed,
  PlusCircle,
  TriangleAlert,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Convert columns to a function that accepts parameters
export const getColumns = (clients: ALL_CLIENTS_QUERYResult): ColumnDef<ALL_CLIENTS_QUERYResult[number]>[] => [
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
    accessorKey: "internalId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Client ID" />,
    cell: ({ row }) => (
      <Link className="hover:underline" href={`/clients/${row.original?._id}`}>
        <div className="w-[100px] font-bold">{row.original?.internalId}</div>
      </Link>
    ),
    // enableSorting: false,
    // enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Client Name" />,
    cell: ({ row }) => {
      return (
        <Link className="hover:underline" href={`/clients/${row.original?._id}`}>
          <div className="flex space-x-2">
            <span className="max-w-[350px] truncate font-normal">{row.original?.name}</span>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "projects",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Projects" />,
    cell: ({ row }) => {
      const num_of_projects = row.original?.projects.length;
      return (
        <Link className="hover:underline" href={`/clients/${row.original?._id}`}>
          <div className="flex space-x-2">
            <span className="font-normal">{num_of_projects}</span>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "latest_project",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Latest Project" />,
    cell: ({ row }) => {
      const latest_project = row.original?.projects[0];
      return (
        <Link className="hover:underline" href={`/clients/${row.original?._id}`}>
          <div className="flex space-x-2">
            <span className="max-w-[350px] truncate font-normal">
              <span className="font-bold text-primary">{latest_project?.internalId}</span> - {latest_project?.name}
            </span>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "latest_project_due_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Latest Project Due Date" />,
    cell: ({ row }) => {
      const latest_project_due_date = row.original?.projects[0]?.endDate;
      return (
        <Link className="hover:underline" href={`/clients/${row.original?._id}`}>
          <div className="flex space-x-2">
            <span className="max-w-[350px] truncate font-normal">
              {latest_project_due_date ? (
                <span
                  className={`font-bold ${new Date(latest_project_due_date) < new Date() ? "text-destructive" : "text-primary"}`}
                >
                  {format(new Date(latest_project_due_date), "dd/LL/yy")}
                </span>
              ) : (
                "-"
              )}
            </span>
          </div>
        </Link>
      );
    },
  },

  // {
  //   id: "actions",
  //   cell: ({ row }) => (
  //     <DataTableRowActions
  //       sampleClasses={sampleClasses || []}
  //       testMethods={testMethods || []}
  //       service={row.original as ALL_SERVICES_QUERYResult[number]}
  //     />
  //   ),
  // },
];
