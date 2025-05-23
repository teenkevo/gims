"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { ALL_CLIENTS_QUERYResult } from "../../../../../../sanity.types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListEnd, TriangleAlert } from "lucide-react";
import { format } from "date-fns";

// Convert columns to a function that accepts parameters
export const getColumns = (
  clients: ALL_CLIENTS_QUERYResult
): ColumnDef<ALL_CLIENTS_QUERYResult[number]>[] => [
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
    accessorKey: "internalId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client ID" />
    ),
    cell: ({ row }) => (
      <Link
        className="hover:underline"
        href={`/clients/${row.original?._id}?client=${row.original?.name}`}
      >
        <div className="w-[100px] font-bold">{row.original?.internalId}</div>
      </Link>
    ),
    // enableSorting: false,
    // enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client Name" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          className="hover:underline"
          href={`/clients/${row.original?._id}?client=${row.original?.name}`}
        >
          <div className="flex space-x-2">
            <span className="max-w-[350px] truncate font-normal">
              {row.original?.name}
            </span>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "projects",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Number of Projects" />
    ),
    cell: ({ row }) => {
      const num_of_projects = row.original?.projects.length;
      return (
        <Link
          className="hover:underline"
          href={`/clients/${row.original?._id}?client=${row.original?.name}&tab=projects`}
        >
          <div className="flex space-x-2">
            <span className="font-normal">{num_of_projects}</span>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "latest_project",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Latest Project ID" />
    ),
    cell: ({ row }) => {
      const latest_project_id = row.original?.projects[0]?._id;
      const latest_project_internal_id = row.original?.projects[0]?.internalId;
      const latest_project_name = row.original?.projects[0]?.name;
      return (
        <Link
          className="hover:underline"
          href={
            latest_project_id
              ? `/clients/${row.original?._id}/projects/${latest_project_id}?client=${row.original?.name}&project=${latest_project_name}`
              : `/clients/${row.original?._id}?client=${row.original?.name}&tab=projects`
          }
        >
          <div className="flex space-x-2">
            <span className="max-w-[350px] truncate font-normal">
              <span>
                {latest_project_internal_id ? latest_project_internal_id : "-"}
              </span>
            </span>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "latest_project_due_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Latest Project Due Date" />
    ),
    cell: ({ row }) => {
      const latest_project_due_date = row.original?.projects[0]?.endDate;
      const latest_project_id = row.original?.projects[0]?._id;
      return (
        <Link
          className="hover:underline"
          href={
            latest_project_id
              ? `/clients/${row.original?._id}/projects/${latest_project_id}`
              : `/clients/${row.original?._id}?tab=projects`
          }
        >
          <div className="flex space-x-2">
            <span className="max-w-[350px] truncate font-normal">
              {latest_project_due_date ? (
                <Button variant="outline" size="sm">
                  <ListEnd className="text-primary w-4 h-4 mr-2" />
                  {format(new Date(latest_project_due_date), "dd/LL/yy")}
                </Button>
              ) : (
                <Button variant="outline" size="sm">
                  <TriangleAlert className="text-orange-500 w-4 h-4 mr-2" />
                  Not yet set
                </Button>
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
