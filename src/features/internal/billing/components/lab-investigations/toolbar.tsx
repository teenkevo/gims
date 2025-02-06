"use client";

import { Table } from "@tanstack/react-table";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { sample_classes } from "@/features/customer/services/data/data";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";

interface ToolbarProps<TData> {
  table: Table<TData>;
}

export function Toolbar<TData>({ table }: ToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter services..."
          value={
            (table.getColumn("test_parameter")?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) =>
            table
              .getColumn("test_parameter")
              ?.setFilterValue(event.target.value)
          }
          className="h-8 w-full lg:w-[250px]"
        />
        {table.getColumn("sample_class") && (
          <DataTableFacetedFilter
            column={table.getColumn("sample_class")}
            title="Sample Class"
            options={sample_classes}
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
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
