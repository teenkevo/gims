"use client";

import { useMemo, useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Cross2Icon } from "@radix-ui/react-icons";
import { PlusCircleIcon } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { LAB_BY_ID_QUERY_RESULT } from "../../../../../sanity.types";

type LabProject = NonNullable<
  LAB_BY_ID_QUERY_RESULT[number]["projects"]
>[number];

export function LabProjectsTable({
  labId,
  projects,
}: {
  labId: string;
  projects: LabProject[];
}) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const createHref = `/projects/create?labId=${labId}`;

  const columns = useMemo<ColumnDef<LabProject>[]>(
    () => [
      {
        accessorKey: "internalId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Project ID" />
        ),
        cell: ({ row }) => (
          <Link
            className="font-medium hover:underline"
            href={`/projects/${row.original._id}`}
          >
            {row.original.internalId ?? "—"}
          </Link>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <Link
            className="max-w-[240px] truncate hover:underline"
            href={`/projects/${row.original._id}`}
          >
            {row.original.name ?? "—"}
          </Link>
        ),
      },
      {
        accessorKey: "startDate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Start Date" />
        ),
        cell: ({ row }) =>
          row.original.startDate
            ? format(new Date(row.original.startDate), "dd MMM yyyy")
            : "—",
      },
      {
        accessorKey: "endDate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="End Date" />
        ),
        cell: ({ row }) =>
          row.original.endDate
            ? format(new Date(row.original.endDate), "dd MMM yyyy")
            : "—",
      },
    ],
    []
  );

  const table = useReactTable({
    data: projects,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const isFiltered = columnFilters.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search projects..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <Button asChild className="h-8" variant="default">
          <Link href={createHref}>
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Create Project
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No projects match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
