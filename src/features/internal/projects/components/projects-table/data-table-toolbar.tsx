"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import {
  DUE_STATUS_FILTERS,
  QUOTATION_STATUS_FILTERS,
} from "../../constants";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onDeleteSelected?: () => void;
}

export function DataTableToolbar<TData>({
  table,
  onDeleteSelected,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    Boolean(table.getState().globalFilter);
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Search projects..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("quotationStatus") ? (
          <DataTableFacetedFilter
            column={table.getColumn("quotationStatus")}
            title="Filter by billing status"
            options={[...QUOTATION_STATUS_FILTERS]}
          />
        ) : null}
        {table.getColumn("dueStatus") ? (
          <DataTableFacetedFilter
            column={table.getColumn("dueStatus")}
            title="Filter by Due Condition"
            options={[...DUE_STATUS_FILTERS]}
          />
        ) : null}
        {isFiltered ? (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter("");
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        ) : null}
        {selectedCount > 0 && onDeleteSelected ? (
          <Button
            variant="destructive"
            onClick={onDeleteSelected}
            size="sm"
            className="h-8"
          >
            Delete {selectedCount} selected
          </Button>
        ) : null}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
