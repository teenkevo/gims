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
import { UserMinus } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
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
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import type { ALL_PERSONNEL_QUERY_RESULT } from "../../../../../sanity.types";
import { AddLabStaffDialog } from "./add-lab-staff-dialog";
import { RemoveLabStaffDialog } from "./remove-lab-staff-dialog";

const PERSONNEL_STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "On Leave", value: "on-leave" },
  { label: "Terminated", value: "terminated" },
  { label: "Retired", value: "retired" },
  { label: "Resigned", value: "resigned" },
  { label: "Other", value: "other" },
];

const statusStyles: Record<string, string> = {
  active: "border-primary/20 bg-primary/10 text-primary",
  inactive: "border-destructive/20 bg-destructive/10 text-destructive",
  "on-leave": "border-orange-500/20 bg-orange-500/10 text-orange-500",
  terminated: "border-destructive bg-destructive/10 text-destructive",
  retired: "border-purple-500 bg-purple-500/10 text-purple-500",
  resigned: "border-destructive bg-destructive/10 text-destructive",
  other: "border-gray-500 bg-gray-500/10 text-gray-500",
};

function PersonnelStatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-muted-foreground">—</span>;

  const label =
    PERSONNEL_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status;

  return (
    <span
      className={`rounded-md border px-2 py-1 text-xs font-bold ${statusStyles[status] ?? statusStyles.other}`}
    >
      {label}
    </span>
  );
}

export function LabStaffingPersonnelTable({
  labId,
  allPersonnel,
  assignedIds,
  disabled = false,
}: {
  labId: string;
  allPersonnel: ALL_PERSONNEL_QUERY_RESULT;
  assignedIds: string[];
  disabled?: boolean;
}) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [peopleToRemove, setPeopleToRemove] =
    useState<ALL_PERSONNEL_QUERY_RESULT>([]);

  const assignedPersonnel = useMemo(
    () => allPersonnel.filter((person) => assignedIds.includes(person._id)),
    [allPersonnel, assignedIds]
  );

  const availablePersonnel = useMemo(
    () => allPersonnel.filter((person) => !assignedIds.includes(person._id)),
    [allPersonnel, assignedIds]
  );

  const columns = useMemo<ColumnDef<ALL_PERSONNEL_QUERY_RESULT[number]>[]>(
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
        accessorKey: "internalId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ID" />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.internalId ?? "—"}</span>
        ),
      },
      {
        accessorKey: "fullName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <span className="max-w-[200px] truncate">
            {row.original.fullName ?? "—"}
          </span>
        ),
        filterFn: (row, _id, value) => {
          const search = String(value).toLowerCase();
          const name = row.original.fullName?.toLowerCase() ?? "";
          const internalId = row.original.internalId?.toLowerCase() ?? "";
          const email = row.original.email?.toLowerCase() ?? "";
          const role =
            row.original.departmentRoles?.[0]?.role?.toLowerCase() ?? "";
          return (
            name.includes(search) ||
            internalId.includes(search) ||
            email.includes(search) ||
            role.includes(search)
          );
        },
      },
      {
        id: "role",
        accessorFn: (row) => row.departmentRoles?.[0]?.role ?? "",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ row }) => (
          <span>{row.original.departmentRoles?.[0]?.role ?? "—"}</span>
        ),
      },
      {
        id: "department",
        accessorFn: (row) =>
          row.departmentRoles?.[0]?.department?.department ?? "",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Department" />
        ),
        cell: ({ row }) => (
          <span>
            {row.original.departmentRoles?.[0]?.department?.department ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => (
          <PersonnelStatusBadge status={row.original.status} />
        ),
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
              onClick={() => setPeopleToRemove([row.original])}
            >
              <UserMinus className="h-4 w-4" />
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
    data: assignedPersonnel,
    columns,
    getRowId: (row) => row._id,
    state: {
      columnFilters,
      rowSelection,
    },
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

  const handleBulkRemove = () => {
    const selected = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original);
    if (selected.length > 0) {
      setPeopleToRemove(selected);
    }
  };

  const handleRemoveDialogClose = () => {
    setPeopleToRemove([]);
    setRowSelection({});
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search assigned staff..."
              value={
                (table.getColumn("fullName")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("fullName")?.setFilterValue(event.target.value)
              }
              className="h-8 w-[150px] lg:w-[250px]"
              disabled={disabled}
            />
            {table.getColumn("status") && (
              <DataTableFacetedFilter
                column={table.getColumn("status")}
                title="Status"
                options={PERSONNEL_STATUS_OPTIONS}
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
                  onClick={handleBulkRemove}
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
          <AddLabStaffDialog
            labId={labId}
            availablePersonnel={availablePersonnel}
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
                    No staff assigned to this laboratory yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <RemoveLabStaffDialog
        labId={labId}
        people={peopleToRemove}
        open={peopleToRemove.length > 0}
        onClose={handleRemoveDialogClose}
      />
    </>
  );
}
