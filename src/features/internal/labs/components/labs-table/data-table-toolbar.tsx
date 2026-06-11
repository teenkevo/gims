import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { LAB_STATUSES } from "../../constants";

const statusOptions = LAB_STATUSES.map((status) => ({
  label: status.label,
  value: status.value,
}));

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onDeleteSelected: () => void;
}

export function DataTableToolbar<TData>({
  table,
  onDeleteSelected,
}: DataTableToolbarProps<TData>) {
  const selectedCount = table.getSelectedRowModel().rows.length;
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Search laboratories..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
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
              variant="destructive"
              onClick={onDeleteSelected}
              size="sm"
              className="h-8"
            >
              Delete {selectedCount} selected
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedCount} of {table.getFilteredRowModel().rows.length}{" "}
              row(s) selected.
            </span>
          </>
        )}
      </div>
    </div>
  );
}
