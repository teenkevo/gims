// core
import { NumericFormat } from "react-number-format";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

const priceSchema = z.object({
  price: z.coerce
    .number()
    .optional()
    .refine((val) => val && val > 0, {
      message: "Required",
    }),
  quantity: z.coerce
    .number()
    .optional()
    .refine((val) => val && val > 0, {
      message: "Required",
    }),
  total: z.coerce.number().optional(),
});
export type PriceValue = {
  price: number;
  quantity: number;
  total: number | undefined;
};

interface PriceProps {
  onSubmit: () => void;
  initialValues: Partial<PriceValue>;
  onPriceChange: (price: number | undefined) => void;
  onQuantityChange: (quantity: number | undefined) => void;
  isRowSelected: boolean;
  currency: string;
}

export function PriceForm({
  onSubmit,
  initialValues,
  onPriceChange,
  onQuantityChange,
  isRowSelected,
  currency,
}: PriceProps) {
  const { price, quantity, total } = initialValues;

  const form = useForm<PriceValue>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(priceSchema),
    defaultValues: {
      price,
      quantity,
      total,
    },
  });

  useEffect(() => {
    if (isRowSelected) {
      form.trigger("price");
      form.trigger("quantity");
    } else {
      form.clearErrors();
    }
  }, [isRowSelected]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-7">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <NumericFormat
                  className="max-w-[150px] min-w-[130px] text-[16px] md:text-sm"
                  customInput={Input}
                  thousandSeparator={true}
                  prefix={`${currency.toUpperCase()} `}
                  placeholder="Add a price"
                  value={field.value}
                  disabled={!isRowSelected}
                  onValueChange={(target) => {
                    onPriceChange(target.floatValue);
                    field.onChange(target.floatValue);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <NumericFormat
                  className="max-w-[100px] min-w-[100px] text-[16px] md:text-sm"
                  customInput={Input}
                  placeholder="Quantity"
                  value={field.value}
                  disabled={!isRowSelected}
                  onValueChange={(target) => {
                    onQuantityChange(target.floatValue);
                    field.onChange(target.floatValue);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="total"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <NumericFormat
                  disabled
                  className="max-w-[130px] min-w-[120px] text-[16px] md:text-sm"
                  customInput={Input}
                  thousandSeparator={true}
                  prefix={`${currency.toUpperCase()} `}
                  placeholder="Total"
                  value={form?.watch("price") * form?.watch("quantity")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
