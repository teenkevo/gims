"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import type {
  ALL_SERVICES_QUERYResult,
  ALL_PROJECTS_QUERYResult,
  Quotation,
} from "../../../../../../sanity.types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  CheckCircle,
  DollarSign,
  ListEnd,
  ListStart,
  ReceiptText,
  Send,
  XCircle,
  CreditCard,
  FileIcon as FileInvoice,
  CircleDashed,
  PlusCircle,
  TriangleAlert,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { SetDateRangeDialog } from "../set-project-date-range";
import { quotationTotal } from "../../constants";
import { NumericFormat } from "react-number-format";

// Convert columns to a function that accepts parameters
export const getColumns = (
  projects: ALL_PROJECTS_QUERYResult,
  role: string
): ColumnDef<ALL_PROJECTS_QUERYResult[number]>[] => [
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
    accessorKey: "internalId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project ID" />
    ),
    cell: ({ row }) => (
      <Link className="hover:underline" href={`/projects/${row.original?._id}`}>
        <div className="w-[100px] font-bold">{row.original?.internalId}</div>
      </Link>
    ),
    // enableSorting: false,
    // enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project Name" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          className="hover:underline"
          href={`/projects/${row.original?._id}`}
        >
          <div className="flex space-x-2">
            <span className="max-w-[350px] truncate font-normal">
              {row.original?.name}
            </span>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Date" />
    ),
    cell: ({ row }) =>
      row.original?.startDate ? (
        <SetDateRangeDialog
          role={role}
          icon={<ListStart className="text-primary w-4 h-4 mr-2" />}
          buttonText={format(new Date(row.original?.startDate), "dd/LL/yy")}
          project={row.original}
        />
      ) : (
        <SetDateRangeDialog
          role={role}
          icon={<TriangleAlert className="text-orange-500 w-4 h-4 mr-2" />}
          buttonText={role === "admin" ? "Set start date" : "Not yet set"}
          project={row.original}
        />
      ),
  },

  {
    accessorKey: "endDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Date" />
    ),
    cell: ({ row }) =>
      row.original?.endDate ? (
        <SetDateRangeDialog
          role={role}
          icon={<ListEnd className="text-primary w-4 h-4 mr-2" />}
          buttonText={format(new Date(row.original?.endDate), "dd/LL/yy")}
          project={row.original}
        />
      ) : (
        <SetDateRangeDialog
          role={role}
          icon={<TriangleAlert className="text-orange-500 w-4 h-4 mr-2" />}
          buttonText={role === "admin" ? "Set end date" : "Not yet set"}
          project={row.original}
        />
      ),
  },
  {
    accessorKey: "projectBilling",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project Billing" />
    ),
    cell: ({ row }) => {
      const parentQuotation = row.original?.quotation;
      const parentQuotationHasRevisions =
        (parentQuotation?.revisions?.length ?? 0) > 0;
      const quotation = parentQuotationHasRevisions
        ? parentQuotation?.revisions?.[0]
        : parentQuotation;

      const total = quotationTotal(quotation as Quotation);
      const currency = quotation?.currency;

      const status =
        quotation?.status === "draft"
          ? "Quotation created"
          : quotation?.status === "sent"
            ? "Quotation sent"
            : quotation?.status === "accepted"
              ? "Quotation accepted"
              : quotation?.status === "rejected"
                ? "Quotation rejected"
                : quotation?.status === "invoiced"
                  ? "Invoice issued"
                  : quotation?.status === "paid"
                    ? "Invoice paid"
                    : "Not Billed";

      const badgeVariant =
        quotation?.status === "draft" ? (
          <Badge variant="outline" className="mr-2 bg-primary/10 ">
            {status}
          </Badge>
        ) : quotation?.status === "sent" ? (
          <Badge
            variant="outline"
            className="mr-2 bg-primary/10 border-dashed border-primary"
          >
            {status}
          </Badge>
        ) : quotation?.status === "accepted" ? (
          <Badge
            variant="outline"
            className="mr-2 bg-primary/10 border-dashed border-primary"
          >
            {status}
          </Badge>
        ) : quotation?.status === "rejected" ? (
          <Badge
            variant="outline"
            className="mr-2 bg-destructive/10 border-dashed border-destructive"
          >
            {status}
          </Badge>
        ) : quotation?.status === "invoiced" ? (
          <Badge
            variant="outline"
            className="mr-2 bg-primary/10 border-dashed border-primary"
          >
            {status}
          </Badge>
        ) : quotation?.status === "paid" ? (
          <Badge
            variant="outline"
            className="mr-2 bg-primary/10 border-dashed border-primary"
          >
            {status}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="mr-2 bg-primary/10 border-dashed border-orange-500"
          >
            {status}
          </Badge>
        );
      return (
        <Link
          href={`/projects/${row.original?._id}?project=${row.original?.name}&tab=billing`}
          className="text-xs flex items-center p-1 border rounded-md hover:bg-muted w-[250px]"
        >
          {/* {icon} */}
          {badgeVariant}
          {quotation
            ? `${currency?.toUpperCase()} ${total.toLocaleString()}`
            : "Generate quotation"}
        </Link>
      );
    },
  },

  // {
  //   accessorKey: "stagesCompleted",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Stages Completed" />
  //   ),
  //   cell: ({ row }) => {
  //     // Now you can use sampleClasses here if needed
  //     return (
  //       <div className="flex space-x-2">
  //         {row.original?.stagesCompleted?.map((stage) => (
  //           <Badge key={stage} variant="outline">
  //             {stage}
  //           </Badge>
  //         ))}
  //       </div>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "status",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Status" />
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex w-[100px] items-center">
  //         {row.original?.status === "active" && (
  //           <Badge variant="outline">
  //             <CheckCircledIcon className="mr-2 h-4 w-4 text-primary" />
  //             Active
  //           </Badge>
  //         )}
  //         {row.original?.status === "inactive" && (
  //           <Badge variant="outline">
  //             <CrossCircledIcon className="mr-2 h-4 w-4 text-orange-500" />
  //             Inactive
  //           </Badge>
  //         )}
  //       </div>
  //     );
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue);
  //   },
  // },
  // {
  //   id: "actions",
  //   cell: ({ row }) => (
  //     <DataTableRowActions
  //       sampleClasses={sampleClasses || []}
  //       testMethods={testMethods || []}
  //       service={row.original as ALL_SERVICES_QUERYResult[number]}
  //     />
  //   ),
  // },
];
