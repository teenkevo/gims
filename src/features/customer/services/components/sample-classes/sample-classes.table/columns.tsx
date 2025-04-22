"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import type {
  ALL_SAMPLE_CLASSES_QUERYResult,
  ALL_SERVICES_QUERYResult,
  ALL_STANDARDS_QUERYResult,
} from "../../../../../../../sanity.types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Convert columns to a function that accepts parameters
export const getColumns = (
  services?: ALL_SERVICES_QUERYResult
): ColumnDef<ALL_SAMPLE_CLASSES_QUERYResult[number]>[] => [
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="text-base"
        column={column}
        title="Name"
      />
    ),
    cell: ({ row }) => (
      <Link
        className="hover:underline"
        href={`/services/sample-classes/${row.original?._id}`}
      >
        <div className="w-[100px]">{row.getValue("name")}</div>
      </Link>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   accessorKey: "description",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Description" />
  //   ),
  //   cell: ({ row }) => (
  //     <Link
  //       className="hover:underline"
  //       href={`/services/sample-classes/${row.original?._id}`}
  //     >
  //       <div className="max-w-[500px] truncate font-bold">
  //         {row.getValue("description")}
  //       </div>
  //     </Link>
  //   ),
  //   // enableSorting: false,
  //   // enableHiding: false,
  // },

  // {
  //   accessorKey: "test_methods",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Test Methods" />
  //   ),
  //   cell: ({ row }) => {
  //     const testMethodsInStandard = testMethods?.filter(
  //       (testMethod) => testMethod.standard?._id === row.original?._id
  //     );
  //     return (
  //       <div className="flex space-x-2">
  //         <Link href={`/services/standards/${row.original?._id}`}>
  //           <Button
  //             className="w-16 hover:border-primary border-2 text-primary"
  //             variant="secondary"
  //           >
  //             {testMethodsInStandard?.length}
  //           </Button>
  //         </Link>
  //       </div>
  //     );
  //   },
  // },

  // {
  //   id: "actions",
  //   cell: ({ row }) => (
  //     <DataTableRowActions
  //       standard={row.original as ALL_STANDARDS_QUERYResult[number]}
  //     />
  //   ),
  // },
];
