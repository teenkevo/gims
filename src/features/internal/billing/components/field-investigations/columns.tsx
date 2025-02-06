import { Dispatch, SetStateAction, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FieldService,
  Service,
} from "@/features/customer/services/data/schema";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { PriceForm } from "./price-form";

interface ColumnProps {
  setFieldInvestigationsTableData: Dispatch<SetStateAction<FieldService[]>>;
}

export const columns = ({
  setFieldInvestigationsTableData,
}: ColumnProps): ColumnDef<FieldService>[] => [
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
      <DataTableColumnHeader className="text-sm" column={column} title="Code" />
    ),
    cell: ({ row }) => (
      <div className="w-[40px] font-bold">{row.getValue("code")}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "test_parameter",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="text-sm"
        column={column}
        title="Test Parameter"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[300px] truncate font-normal">
            {row.getValue("test_parameter")}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "sample_class",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="text-sm"
        column={column}
        title="Sample Class"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          <span>Field</span>
        </div>
      );
    },
  },
  {
    id: "price",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="text-sm"
        column={column}
        title="Unit Price - Quantity - Total"
      />
    ),
    cell: ({ row }) => {
      const price = row.original.price;
      const quantity = row.original.quantity;
      const onSubmit = () => null;

      const onPriceChange = (newPrice: number | undefined) => {
        setFieldInvestigationsTableData((prevData) =>
          prevData.map((item) =>
            item.id === row.original.id
              ? {
                  ...item,
                  price: newPrice,
                }
              : item
          )
        );
      };

      const onQuantityChange = (newQuantity: number | undefined) => {
        console.log("newQuantity", newQuantity);
        setFieldInvestigationsTableData((prevData) =>
          prevData.map((item) =>
            item.id === row.original.id
              ? {
                  ...item,
                  quantity: newQuantity,
                }
              : item
          )
        );
      };

      return (
        <PriceForm
          initialValues={{ price, quantity }}
          isRowSelected={row.getIsSelected()}
          onSubmit={onSubmit}
          onPriceChange={onPriceChange}
          onQuantityChange={onQuantityChange}
        />
      );
    },
  },
];
