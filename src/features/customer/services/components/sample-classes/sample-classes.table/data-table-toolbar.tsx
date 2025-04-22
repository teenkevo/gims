import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  openDialog: () => void;
}

export function DataTableToolbar<TData>({
  table,
  openDialog,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-wrap gap-2 flex-1 items-center">
        <Input
          placeholder="Filter sample classes by name"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[250px] lg:w-[250px]"
        />
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
