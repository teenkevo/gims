/* columns.tsx
   Derived-data version ─ no effects needed */
import { Dispatch, SetStateAction, useState } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { PriceForm } from "./price-form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ALL_SERVICES_QUERYResult } from "../../../../../../sanity.types";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
export type ExtendedService = ALL_SERVICES_QUERYResult[number] & {
  price?: number;
  quantity?: number;
  /** added by mergeQuotation to pre-select a row */
  preSelected?: boolean;
};

interface ColumnProps {
  setTableData: Dispatch<SetStateAction<ExtendedService[]>>;
  currency: string;
}

/* ------------------------------------------------------------------ */
/* Pure cell components                                               */
/* ------------------------------------------------------------------ */
const SelectCell = ({ row }: { row: Row<ExtendedService> }) => (
  <Checkbox
    checked={row.getIsSelected()}
    onCheckedChange={(v) => row.toggleSelected(!!v)}
    aria-label="Select row"
    className="translate-y-[2px]"
  />
);

const TestMethodCell = ({
  row,
  setTableData,
}: {
  row: Row<ExtendedService>;
  setTableData: Dispatch<SetStateAction<ExtendedService[]>>;
}) => {
  const methods = row.original.testMethods?.map(
    (m) => m.standard?.acronym ?? ""
  );

  const initial = row.original.testMethods?.find((m: any) => m.selected)
    ?.standard?.acronym;
  const [selected, setSelected] = useState<string | null>(initial ?? null);

  const updateFlags = (value: string) =>
    row.original.testMethods
      ? row.original.testMethods.map((tm) =>
          tm.standard?.acronym === value
            ? { ...tm, selected: true }
            : { ...tm, selected: false }
        )
      : null;

  const isChosen = row.original.testMethods?.some(
    (tm) => tm.standard?.acronym === selected
  );

  return (
    <div>
      <div className="flex items-start space-x-2">
        <ToggleGroup
          type="single"
          variant="outline"
          disabled={!row.getIsSelected()}
          value={selected ?? ""}
          onValueChange={(value) => {
            setSelected(value);
            setTableData((prev) =>
              prev.map((svc) =>
                svc._id === row.original._id
                  ? { ...svc, testMethods: updateFlags(value) }
                  : svc
              )
            );
          }}
        >
          {methods?.map((m) => (
            <ToggleGroupItem key={m} value={m}>
              {m}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      {row.getIsSelected() && !isChosen && (
        <p className="text-destructive text-xs mt-2 font-medium">
          Choose a method
        </p>
      )}
    </div>
  );
};

const PriceCell = ({
  row,
  setTableData,
  currency,
}: {
  row: Row<ExtendedService>;
  setTableData: Dispatch<SetStateAction<ExtendedService[]>>;
  currency: string;
}) => {
  const onPriceChange = (price?: number) =>
    setTableData((prev) =>
      prev.map((svc) =>
        svc._id === row.original._id ? { ...svc, price } : svc
      )
    );

  const onQuantityChange = (quantity?: number) =>
    setTableData((prev) =>
      prev.map((svc) =>
        svc._id === row.original._id ? { ...svc, quantity } : svc
      )
    );

  return (
    <PriceForm
      initialValues={{
        price: row.original.price,
        quantity: row.original.quantity,
      }}
      isRowSelected={row.getIsSelected()}
      onSubmit={() => undefined}
      onPriceChange={onPriceChange}
      onQuantityChange={onQuantityChange}
      currency={currency}
    />
  );
};

/* ------------------------------------------------------------------ */
/* Column factory                                                     */
/* ------------------------------------------------------------------ */
export const columns = ({
  setTableData,
  currency,
}: ColumnProps): ColumnDef<ExtendedService>[] => [
  /* 1 ▸ Select ----------------------------------------------------- */
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => <SelectCell row={row} />,
    enableSorting: false,
    enableHiding: false,
  },

  /* 2 ▸ Code ------------------------------------------------------- */
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" className="text-sm" />
    ),
    cell: ({ row }) => (
      <div className="w-[70px] font-bold">{row.getValue("code")}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },

  /* 3 ▸ Test parameter -------------------------------------------- */
  {
    accessorKey: "testParameter",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Test Parameter"
        className="text-sm"
      />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="max-w-[300px] truncate font-normal">
          {row.getValue("testParameter")}
        </span>
      </div>
    ),
  },

  /* 4 ▸ Test methods ---------------------------------------------- */
  {
    accessorKey: "testMethods",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Test Methods"
        className="text-sm"
      />
    ),
    cell: ({ row }) => <TestMethodCell row={row} setTableData={setTableData} />,
  },

  /* 5 ▸ Sample class ---------------------------------------------- */
  {
    accessorKey: "sampleClass",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Sample Class"
        className="text-sm"
      />
    ),
    cell: ({ row }) => (
      <div className="flex w-[100px] items-center">
        <span>{row.original.sampleClass?.name}</span>
      </div>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },

  /* 6 ▸ Price / Qty / Total --------------------------------------- */
  {
    id: "price",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Unit Price – Quantity – Total"
        className="text-sm"
      />
    ),
    cell: ({ row }) => (
      <PriceCell row={row} setTableData={setTableData} currency={currency} />
    ),
  },
];
