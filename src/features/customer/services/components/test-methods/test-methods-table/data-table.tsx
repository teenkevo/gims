"use client";

import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ALL_STANDARDS_QUERYResult,
  ALL_TEST_METHODS_QUERYResult,
} from "../../../../../../../sanity.types";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import Link from "next/link";
import Image from "next/image";
import { DataTableRowActions } from "./data-table-row-actions";
import { DeleteMultipleTestMethods } from "./delete-multiple-test-methods";
import { getDocumentsReferencingMultipleTestMethods } from "@/lib/actions";

// Define columns
const getColumns = (
  standards?: ALL_STANDARDS_QUERYResult
): ColumnDef<ALL_TEST_METHODS_QUERYResult[number]>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
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
      <DataTableColumnHeader className="ml-2" column={column} title="Code" />
    ),
    cell: ({ row }) => (
      <Link
        className="hover:underline"
        href={`/services/test-methods/${row.original?._id}`}
      >
        <div className="w-[250px] ml-5 font-bold">{row.getValue("code")}</div>
      </Link>
    ),
  },

  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <Link
        className="hover:underline"
        href={`/services/test-methods/${row.original?._id}`}
      >
        <div
          className="max-w-[450px] truncate"
          title={row.getValue("description")}
        >
          {row.getValue("description") || "—"}
        </div>
      </Link>
    ),
  },
  {
    accessorKey: "standard.acronym",
    header: "Standard",
    cell: ({ row }) => {
      const standard = row.original.standard;
      return (
        <div>
          {standard?.acronym ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    className="hover:underline"
                    href={`/services/test-methods/${row.original?._id}`}
                  >
                    <Badge variant="outline">{standard.acronym}</Badge>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to view test method details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            "—"
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "documents",
    header: "Documents",
    cell: ({ row }) => {
      const documents = row.getValue("documents") as {
        _key: string;
        asset: {
          url: string;
        };
      }[];
      return (
        <div className="flex flex-wrap gap-1">
          {documents?.map((document, index) => (
            <Button
              key={document._key}
              variant="outline"
              size="sm"
              className="h-8 px-2"
            >
              <Link
                className="flex items-center"
                href={document.asset?.url || ""}
                target="_blank"
              >
                <Image
                  src="/pdf.png"
                  alt="PDF"
                  width={16}
                  height={16}
                  className="h-5 w-5 mr-1"
                />
                {index + 1}
              </Link>
            </Button>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions
        standards={standards || []}
        testMethod={row.original as ALL_TEST_METHODS_QUERYResult[number]}
      />
    ),
  },
];

export default function DataTable({
  testMethods,
  standards,
}: {
  testMethods: ALL_TEST_METHODS_QUERYResult;
  standards: ALL_STANDARDS_QUERYResult;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [filteredData, setFilteredData] =
    useState<ALL_TEST_METHODS_QUERYResult>(testMethods);

  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const [referencingDocs, setReferencingDocs] = useState<
    { testMethodId: string; documents: any[] }[]
  >([]);

  // Filter test methods when standardId changes
  useEffect(() => {
    setFilteredData(testMethods);
  }, [testMethods]);

  const columns = useMemo(
    () =>
      getColumns(standards) as ColumnDef<
        ALL_TEST_METHODS_QUERYResult[number]
      >[],
    [standards, testMethods]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    getRowId: (row) => uuidv4(),
  });

  const testMethodIds = table
    .getSelectedRowModel()
    .rows.map((row) => (row.original as { _id: string })._id);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 items-center py-4">
        <Input
          placeholder="Filter test methods by code..."
          value={(table.getColumn("code")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("code")?.setFilterValue(event.target.value)
          }
          className="max-w-sm md:max-w-md"
        />
        {table.getSelectedRowModel().rows.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              onClick={async () => {
                const docs =
                  await getDocumentsReferencingMultipleTestMethods(
                    testMethodIds
                  );
                setReferencingDocs(docs);
                setOpenDialog(true);
              }}
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
        <DeleteMultipleTestMethods
          referencingDocs={referencingDocs}
          ids={testMethodIds}
          testMethods={testMethods}
          open={openDialog}
          onClose={() => setOpenDialog(false)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id === "standard.acronym" ? "Standard" : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
