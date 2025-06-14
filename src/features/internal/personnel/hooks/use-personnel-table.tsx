"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { ALL_PERSONNEL_QUERYResult } from "../../../../../sanity.types";
import { DataTableRowActions } from "../components/row-actions/data-table-row-actions";

type PersonnelWithRole = ALL_PERSONNEL_QUERYResult[number] & {
  currentRole: string;
  currentDepartment: string;
  currentStatus: string;
};

export function usePersonnelTable(
  data: Array<{ person: ALL_PERSONNEL_QUERYResult[number]; role: string }>,
  departmentRoles: Record<
    string,
    { roles: (string | undefined)[]; departmentId: string }
  >
) {
  const tableData: PersonnelWithRole[] = useMemo(() => {
    return data.map(({ person, role }) => ({
      ...person,
      currentRole: role,
      currentStatus: person.status || "",
      currentDepartment:
        person.departmentRoles?.find((dr) => dr.role === role)?.department
          ?.department || "",
    }));
  }, [data]);

  const columns = useMemo<ColumnDef<PersonnelWithRole>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: "fullName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => {
          const person = row.original;
          const initials =
            person.fullName
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase() || "";

          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src="/placeholder.svg"
                  alt={person.fullName || ""}
                />
                <AvatarFallback className="text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{person.fullName}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "internalId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Internal ID" />
        ),
        cell: ({ getValue }) => (
          <span className=" text-sm">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: "currentRole",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ getValue }) => {
          const role = getValue() as string;
          return (
            <span
              className={`inline-flex px-2 py-1 text-xs rounded-md border border-primary`}
            >
              {role}
            </span>
          );
        },
      },
      {
        accessorKey: "phone",
        header: ({ column }) => (
          <DataTableColumnHeader
            className="text-xs"
            column={column}
            title="Phone"
          />
        ),
        cell: ({ getValue }) => (
          <span className=" text-sm">{getValue() as string}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "currentStatus",
        header: ({ column }) => (
          <DataTableColumnHeader
            className="text-xs"
            column={column}
            title="Status"
          />
        ),
        cell: ({ getValue }) => {
          const status = getValue() as string;
          const statusColor = {
            active: "border-primary/20 bg-primary/10 text-primary",
            inactive:
              "border-destructive/20 bg-destructive/10 text-destructive",
            "on-leave": "border-orange-500/20 bg-orange-500/10 text-orange-500",
            terminated: "border-destructive bg-destructive/10 text-destructive",
            retired: "border-purple-500 bg-purple-500/10 text-purple-500",
            resigned: "border-destructive bg-destructive/10 text-destructive",
            other: "border-gray-500 bg-gray-500/10 text-gray-500",
          };
          return (
            <span
              className={`font-bold text-xs rounded-md px-2 py-1 border ${statusColor[status as keyof typeof statusColor]}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DataTableRowActions
            personnel={row.original}
            departmentRoles={departmentRoles}
          />
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return { table, flexRender };
}
