import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { ALL_SAMPLE_CLASSES_QUERYResult } from "../../../../../../sanity.types";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  openDialog: () => void;
}

export function DataTableToolbar<TData>({
  table,
  openDialog,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-wrap gap-2 flex-1 items-center">
        <Input
          placeholder="Filter contacts by name"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 lg:max-w-[400px]"
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
        {table.getSelectedRowModel().rows.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              onClick={openDialog}
              size="sm"
              className="h-8"
            >
              Delete {table.getSelectedRowModel().rows.length} selected
            </Button>
            <span className="text-sm text-muted-foreground">
              {table.getSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </span>
          </div>
        )}
      </div>

      <DataTableViewOptions table={table} />
    </div>
  );
}
