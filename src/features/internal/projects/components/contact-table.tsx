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
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { CreateContactDialog } from "./create-contact-dialog";
import { ALL_CONTACTS_QUERYResult } from "../../../../../sanity.types";
import { RemoveContactFromProject } from "./remove-contact-from-project";
import { motion } from "framer-motion";
import { UpdateContactDialog } from "./update-contact-dialog";

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
  // Update the column helper to use the new type
  const columnHelper = createColumnHelper<ExtendedContact>();

  const columns = [
    columnHelper.accessor("name", {
      cell: (info) => (
        <span className="max-w-[300px] truncate">{info.getValue()}</span>
      ),
      header: () => <span>Name</span>,
    }),
    columnHelper.accessor("email", {
      cell: (info) => (
        <span className="max-w-[300px] truncate">{info.getValue()}</span>
      ),
      header: () => <span>Email</span>,
    }),
    columnHelper.accessor("phone", {
      cell: (info) => (
        <span className="max-w-[300px] truncate">{info.getValue()}</span>
      ),
      header: () => <span>Phone Number</span>,
    }),
    columnHelper.accessor("designation", {
      cell: (info) => (
        <span className="max-w-[300px] truncate italic">{info.getValue()}</span>
      ),
      header: () => <span>Designation</span>,
    }),
    columnHelper.accessor("actions", {
      cell: (info) => (
        <div className="flex items-center gap-2">
          <UpdateContactDialog
            contact={info.row.original}
            projectId={projectId}
          />
          <RemoveContactFromProject
            email={info.row.original.email!}
            projectId={projectId}
            contactId={info.row.original._id}
          />
        </div>
      ),
      header: () => <span>Actions</span>,
    }),
  ];
  const table = useReactTable({
    data: projectContacts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="my-10 space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-sm font-bold">Contact Persons</p>
        <CreateContactDialog
          projectId={projectId}
          clientId={clientId}
          existingContacts={existingContacts}
          projectContacts={projectContacts}
        />
      </div>

      <div className="border">
        <Table>
          <TableHeader className="bg-muted">
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
