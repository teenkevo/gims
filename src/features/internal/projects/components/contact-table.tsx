"use client";

import React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { CreateContactDialog } from "./create-contact-dialog";
import { ALL_CONTACTS_QUERYResult } from "../../../../../sanity.types";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { ContactTableRowActions } from "./contact-table-row-actions";

// Extend the type to include actions
type ExtendedContact = ALL_CONTACTS_QUERYResult[number] & { actions?: string };

export function ContactTable({
  projectId,
  clientId,
  projectContacts,
  existingContacts,
}: {
  projectId: string;
  clientId: string;
  projectContacts: ALL_CONTACTS_QUERYResult;
  existingContacts: ALL_CONTACTS_QUERYResult;
}) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  // Update the column helper to use the new type
  const columnHelper = createColumnHelper<ExtendedContact>();

  const columns = [
    columnHelper.accessor("name", {
      cell: (info) => (
        <div className="w-[150px] font-bold">
          <span className="max-w-[300px] truncate">{info.getValue()}</span>
        </div>
      ),
      header: () => <span>Name</span>,
    }),
    columnHelper.accessor("email", {
      cell: (info) => (
        <div className="flex space-x-2">
          <span className="max-w-[350px] truncate font-normal">
            {info.getValue()}
          </span>
        </div>
      ),
      header: () => <span>Email</span>,
    }),
    columnHelper.accessor("phone", {
      cell: (info) => (
        <div className="flex space-x-2">
          <span className="font-normal">{info.getValue()}</span>
        </div>
      ),
      header: () => <span>Phone Number</span>,
    }),
    columnHelper.accessor("designation", {
      cell: (info) => (
        <div className="flex space-x-2">
          <span className="max-w-[350px] truncate font-normal">
            <span className="font-bold text-primary">{info.getValue()}</span>
          </span>
        </div>
      ),
      header: () => <span>Designation</span>,
    }),
    columnHelper.accessor("actions", {
      cell: (info) => (
        <ContactTableRowActions
          contact={info.row.original}
          projectId={projectId}
        />
      ),
      header: () => <span>Actions</span>,
    }),
  ];
  const table = useReactTable({
    data: projectContacts,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const isFiltered = columnFilters.length > 0;

  return (
    <div className="my-10 space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm font-bold">Contact Persons</p>
        <CreateContactDialog
          projectId={projectId}
          clientId={clientId}
          existingContacts={existingContacts}
          projectContacts={projectContacts}
        />
      </div>

      {/* Filter Toolbar */}
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
        </div>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <motion.tr
                  key={row.id}
                  layout="position"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No contact persons present.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />

      <span className="text-sm text-muted-foreground flex gap-2 flex-wrap">
        Learn about
        <a
          onClick={() =>
            toast("🧑‍🍳 In the kitchen...", {
              description:
                "GIMS documentation is still in active development. Check back later",
            })
          }
          href={undefined}
          className="text-primary text-sm flex items-center hover:underline ml-1"
        >
          Contact Persons
          <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </span>
    </div>
  );
}
