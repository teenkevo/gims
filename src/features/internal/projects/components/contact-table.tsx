"use client";

import React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ExternalLink, PlusCircleIcon } from "lucide-react";
import { CreateContactDialog } from "./create-contact-dialog";
import { ALL_CONTACTS_QUERYResult } from "../../../../../sanity.types";

type Contact = {
  name: string;
  email: string;
  phoneNumber: string;
  designation: string;
};
const defaultData: Contact[] = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    phoneNumber: "+1 (555) 123-4567",
    designation: "Software Engineer",
  },
  {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phoneNumber: "+1 (555) 987-6543",
    designation: "Product Manager",
  },
];

const columnHelper = createColumnHelper<Contact>();

const columns = [
  columnHelper.accessor("name", {
    cell: (info) => <span>{info.getValue()}</span>,
    header: () => <span>Name</span>,
  }),
  columnHelper.accessor("email", {
    cell: (info) => <span>{info.getValue()}</span>,
    header: () => <span>Email</span>,
  }),
  columnHelper.accessor("phoneNumber", {
    cell: (info) => info.getValue(),
    header: () => <span>Phone Number</span>,
  }),
  columnHelper.accessor("designation", {
    cell: (info) => <span className="italic">{info.getValue()}</span>,
    header: () => <span>Designation</span>,
  }),
];

export function ContactTable({
  contacts,
  isSubmitting,
}: {
  contacts: ALL_CONTACTS_QUERYResult;
  isSubmitting: boolean;
}) {
  const [data] = React.useState(() => [...defaultData]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="my-6 space-y-4">
      <div className="flex justify-between items-end">
        <p className="text-lg font-medium">Contact Persons</p>
        <CreateContactDialog contacts={contacts} isSubmitting={isSubmitting} />
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
                <TableRow key={row.id}>
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
      <span className="text-sm text-muted-foreground flex">
        Learn more about
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
