"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type {
  ALL_PROJECTS_QUERYResult,
  CLIENT_BY_ID_QUERYResult,
  Quotation,
} from "../../../../../../sanity.types";
import Link from "next/link";
import { ListEnd, ListStart } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { quotationTotal } from "@/features/internal/projects/constants";

// Convert columns to a function that accepts parameters
export const getColumns = (
  client: CLIENT_BY_ID_QUERYResult[number]
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
      <Link
        className="hover:underline"
        href={`/clients/${client._id}/projects/${row.original?._id}`}
      >
        <div className="w-[100px] font-bold">{row.original?.internalId}</div>
      </Link>
    ),
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
          href={`/clients/${client._id}/projects/${row.original?._id}`}
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
        <div className="flex items-center">
          <ListStart className="text-primary w-4 h-4 mr-2" />
          <span className="text-sm">
            {format(new Date(row.original?.startDate), "dd/LL/yy")}
          </span>
        </div>
      ) : (
        <div className="flex items-center">
          <span className="text-sm">Not yet set</span>
        </div>
      ),
  },

  {
    accessorKey: "endDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Date" />
    ),
    cell: ({ row }) =>
      row.original?.endDate ? (
        <div className="flex items-center">
          <ListEnd className="text-primary w-4 h-4 mr-2" />
          <span className="text-sm">
            {format(new Date(row.original?.endDate), "dd/LL/yy")}
          </span>
        </div>
      ) : (
        <div className="flex items-center">
          <span className="text-sm">Not yet set</span>
        </div>
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
            ? "Quotation received"
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
          href={`/clients/${client._id}/projects/${row.original?._id}`}
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
];
