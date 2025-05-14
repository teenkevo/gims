import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { PriceForm } from "./price-form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ALL_SERVICES_QUERYResult,
  PROJECT_BY_ID_QUERYResult,
} from "../../../../../../sanity.types";

export type ExtendedService = ALL_SERVICES_QUERYResult[number] & {
  price?: number;
  quantity?: number;
};

interface ColumnProps {
  setTableData: Dispatch<SetStateAction<ExtendedService[]>>;
  currency: string;
  quotation?: PROJECT_BY_ID_QUERYResult[number]["quotation"];
}

export const columns = ({
  setTableData,
  currency,
  quotation,
}: ColumnProps): ColumnDef<ExtendedService>[] => [
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
    cell: ({ row }) => {
      const quotationItem = quotation?.items?.find(
        (item) => item.service?._ref === row.original._id
      );

      useEffect(() => {
        if (quotationItem) row.toggleSelected(true);
      }, [quotationItem]);

      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      );
    },
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
    accessorKey: "testParameter",
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
            {row.getValue("testParameter")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "testMethods",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="text-sm"
        column={column}
        title="Test Methods"
      />
    ),
    cell: ({ row }) => {
      const testMethods = row.original?.testMethods?.map(
        (m) => m.standard?.acronym
      );

      const quotationItem = quotation?.items?.find(
        (item) => item.service?._ref === row.original._id
      );

      const quotationTestMethod = quotationItem?.testMethod?.standard?.acronym;

      const [selectedValue, setSelectedValue] = useState<string | null>(
        quotationTestMethod || null
      );

      const isATestMethodSelected = row.original?.testMethods?.some(
        (method) => method.standard?.acronym === selectedValue
      );

      // selected test method is updated with a value of selected:true, the rest are set to selected:false
      // only one test method can be selected at a time for a lab investigation
      const updatedSelectedTestMethods = (value: string) => {
        return (
          row.original?.testMethods?.map((method) =>
            method.standard?.acronym === value
              ? { ...method, selected: true }
              : { ...method, selected: false }
          ) || null
        );
      };

      // Run once on mount to inject table data with the selected test method "selected:true"
      useEffect(() => {
        if (quotationTestMethod) {
          setTableData((prev) =>
            prev.map((item) =>
              item._id === row.original._id
                ? {
                    ...item,
                    testMethods:
                      updatedSelectedTestMethods(quotationTestMethod),
                  }
                : item
            )
          );
        }
      }, [quotationTestMethod]);

      return (
        <div>
          <div className="flex items-start space-x-2">
            <ToggleGroup
              type="single"
              variant="outline"
              disabled={!row.getIsSelected()}
              defaultValue={quotationTestMethod || ""}
              onValueChange={(value) => {
                setSelectedValue(value);
                setTableData((prevData) =>
                  prevData.map((item) =>
                    item._id === row.original._id
                      ? {
                          ...item,
                          testMethods: updatedSelectedTestMethods(value),
                        }
                      : item
                  )
                );
              }}
            >
              {testMethods?.map((tm) => (
                <ToggleGroupItem key={tm || ""} value={tm || ""}>
                  {tm}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          {row.getIsSelected() && !isATestMethodSelected && (
            <p className="text-destructive text-xs mt-2 font-medium">
              Choose a method
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "sampleClass",
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
          <span>{row.original?.sampleClass?.name}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
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
      const quotationItem = quotation?.items?.find(
        (item) => item.service?._ref === row.original._id
      );

      const price = quotationItem?.unitPrice;
      const quantity = quotationItem?.quantity;
      const onSubmit = () => null;

      const onPriceChange = (newPrice: number | undefined) => {
        setTableData((prevData) =>
          prevData.map((item) =>
            item._id === row.original._id
              ? {
                  ...item,
                  price: newPrice,
                }
              : item
          )
        );
      };

      const onQuantityChange = (newQuantity: number | undefined) => {
        setTableData((prevData) =>
          prevData.map((item) =>
            item._id === row.original._id
              ? {
                  ...item,
                  quantity: newQuantity,
                }
              : item
          )
        );
      };

      // Run once on mount to inject table data with the selected test method "selected:true"
      useEffect(() => {
        if (quotationItem?.unitPrice && quotationItem?.quantity) {
          setTableData((prev) =>
            prev.map((item) =>
              item._id === row.original._id
                ? {
                    ...item,
                    price: quotationItem?.unitPrice || 0,
                    quantity: quotationItem?.quantity || 0,
                  }
                : item
            )
          );
        }
      }, [quotationItem]);

      return (
        <PriceForm
          initialValues={{
            price: price ?? undefined,
            quantity: quantity ?? undefined,
          }}
          isRowSelected={row.getIsSelected()}
          onSubmit={onSubmit}
          onPriceChange={onPriceChange}
          onQuantityChange={onQuantityChange}
          currency={currency}
        />
      );
    },
  },
];
