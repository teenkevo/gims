"use client";

import { useMemo, useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Unlink } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import type { ALL_SERVICES_QUERY_RESULT } from "../../../../../sanity.types";
import { AddLabTestCapabilitiesDialog } from "./add-lab-test-capabilities-dialog";
import { RemoveLabTestCapabilitiesDialog } from "./remove-lab-test-capabilities-dialog";

const SERVICE_STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

function ServiceStatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-muted-foreground">—</span>;

  const label =
    SERVICE_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status;

  return (
    <Badge
      variant="outline"
      className={
        status === "active"
          ? "border-primary/20 bg-primary/10 text-primary"
          : "border-muted-foreground/30 bg-muted text-muted-foreground"
      }
    >
      {label}
    </Badge>
  );
}

export function LabResourcesTestCapabilitiesTable({
  labId,
  allServices,
  assignedIds,
  disabled = false,
}: {
  labId: string;
  allServices: ALL_SERVICES_QUERY_RESULT;
  assignedIds: string[];
  disabled?: boolean;
}) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [servicesToRemove, setServicesToRemove] =
    useState<ALL_SERVICES_QUERY_RESULT>([]);

  const assignedServices = useMemo(
    () => allServices.filter((item) => assignedIds.includes(item._id)),
    [allServices, assignedIds]
  );

  const availableServices = useMemo(
    () => allServices.filter((item) => !assignedIds.includes(item._id)),
    [allServices, assignedIds]
  );

  const columns = useMemo<ColumnDef<ALL_SERVICES_QUERY_RESULT[number]>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            disabled={disabled}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            disabled={disabled}
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
          <span className="font-medium">{row.original.code ?? "—"}</span>
        ),
      },
      {
        accessorKey: "testParameter",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Test Parameter" />
        ),
        cell: ({ row }) => (
          <span className="max-w-[250px] truncate">
            {row.original.testParameter ?? "—"}
          </span>
        ),
        filterFn: (row, _id, value) => {
          const search = String(value).toLowerCase();
          const testParameter = row.original.testParameter?.toLowerCase() ?? "";
          const code = row.original.code?.toLowerCase() ?? "";
          const sampleClass =
            row.original.sampleClass?.name?.toLowerCase() ?? "";
          return (
            testParameter.includes(search) ||
            code.includes(search) ||
            sampleClass.includes(search)
          );
        },
      },
      {
        id: "sampleClass",
        accessorFn: (row) => row.sampleClass?.name ?? "",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Sample Class" />
        ),
        cell: ({ row }) => (
          <span>{row.original.sampleClass?.name ?? "—"}</span>
        ),
      },
      {
        id: "methods",
        accessorFn: (row) => row.testMethods?.length ?? 0,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Methods" />
        ),
        cell: ({ row }) => (
          <span>
            {row.original.testMethods?.length ?? 0} method
            {(row.original.testMethods?.length ?? 0) !== 1 ? "s" : ""}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => <ServiceStatusBadge status={row.original.status} />,
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              disabled={disabled}
              onClick={() => setServicesToRemove([row.original])}
            >
              <Unlink className="h-4 w-4" />
              <span className="sr-only">Remove from laboratory</span>
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [disabled]
  );

  const table = useReactTable({
    data: assignedServices,
    columns,
    getRowId: (row) => row._id,
    state: { columnFilters, rowSelection },
    enableRowSelection: !disabled,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const selectedCount = table.getSelectedRowModel().rows.length;
  const isFiltered = columnFilters.length > 0;

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search test capabilities..."
              value={
                (table.getColumn("testParameter")?.getFilterValue() as string) ??
                ""
              }
              onChange={(event) =>
                table
                  .getColumn("testParameter")
                  ?.setFilterValue(event.target.value)
              }
              className="h-8 w-[150px] lg:w-[250px]"
              disabled={disabled}
            />
            {table.getColumn("status") && (
              <DataTableFacetedFilter
                column={table.getColumn("status")}
                title="Status"
                options={SERVICE_STATUS_OPTIONS}
              />
            )}
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
            {selectedCount > 0 && (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-8"
                  disabled={disabled}
                  onClick={() =>
                    setServicesToRemove(
                      table
                        .getFilteredSelectedRowModel()
                        .rows.map((row) => row.original)
                    )
                  }
                >
                  Remove {selectedCount} selected
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedCount} of {table.getFilteredRowModel().rows.length}{" "}
                  row(s) selected.
                </span>
              </>
            )}
          </div>
          <AddLabTestCapabilitiesDialog
            labId={labId}
            availableServices={availableServices}
            disabled={disabled}
          />
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
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
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
                    No test capabilities assigned to this laboratory yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <RemoveLabTestCapabilitiesDialog
        labId={labId}
        services={servicesToRemove}
        open={servicesToRemove.length > 0}
        onClose={() => {
          setServicesToRemove([]);
          setRowSelection({});
        }}
      />
    </>
  );
}
