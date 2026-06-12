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
import Link from "next/link";

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
import type { ALL_EQUIPMENT_QUERY_RESULT } from "../../../../../sanity.types";
import { EQUIPMENT_STATUSES, getEquipmentCategoryLabel } from "../../equipment/constants";
import { EquipmentStatusBadge } from "../../equipment/components/equipment-status-badge";
import { AddLabEquipmentDialog } from "./add-lab-equipment-dialog";
import { RemoveLabEquipmentDialog } from "./remove-lab-equipment-dialog";

const statusOptions = EQUIPMENT_STATUSES.map((status) => ({
  label: status.label,
  value: status.value,
}));

export function LabResourcesEquipmentTable({
  labId,
  allEquipment,
  assignedIds,
  disabled = false,
}: {
  labId: string;
  allEquipment: ALL_EQUIPMENT_QUERY_RESULT;
  assignedIds: string[];
  disabled?: boolean;
}) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [equipmentToRemove, setEquipmentToRemove] =
    useState<ALL_EQUIPMENT_QUERY_RESULT>([]);

  const assignedEquipment = useMemo(
    () => allEquipment.filter((item) => assignedIds.includes(item._id)),
    [allEquipment, assignedIds]
  );

  const availableEquipment = useMemo(
    () => allEquipment.filter((item) => !assignedIds.includes(item._id)),
    [allEquipment, assignedIds]
  );

  const columns = useMemo<ColumnDef<ALL_EQUIPMENT_QUERY_RESULT[number]>[]>(
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
          <DataTableColumnHeader column={column} title="Equipment ID" />
        ),
        cell: ({ row }) => (
          <Link
            className="font-medium hover:underline"
            href={`/equipment/${row.original._id}`}
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
            className="max-w-[200px] truncate hover:underline"
            href={`/equipment/${row.original._id}`}
          >
            {row.original.name ?? "—"}
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
        cell: ({ row }) => <span>{row.original.serialNumber ?? "—"}</span>,
      },
      {
        accessorKey: "category",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Category" />
        ),
        cell: ({ row }) => (
          <span>{getEquipmentCategoryLabel(row.original.category)}</span>
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
              onClick={() => setEquipmentToRemove([row.original])}
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
    data: assignedEquipment,
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
              placeholder="Search equipment..."
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="h-8 w-[150px] lg:w-[250px]"
              disabled={disabled}
            />
            {table.getColumn("status") && (
              <DataTableFacetedFilter
                column={table.getColumn("status")}
                title="Status"
                options={statusOptions}
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
                    setEquipmentToRemove(
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
          <AddLabEquipmentDialog
            labId={labId}
            availableEquipment={availableEquipment}
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
                    No equipment assigned to this laboratory yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <RemoveLabEquipmentDialog
        labId={labId}
        equipment={equipmentToRemove}
        open={equipmentToRemove.length > 0}
        onClose={() => {
          setEquipmentToRemove([]);
          setRowSelection({});
        }}
      />
    </>
  );
}
