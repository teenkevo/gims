// core
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { NumericFormat } from "react-number-format";
import { useEffect, useRef } from "react";

// components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const activitySchema = z
  .object({
    activity: z
      .string()
      .min(1, { message: "Please enter the reporting activity" })
      .optional()
      .or(z.literal("")),
    unit: z
      .string()
      .transform((v) => v ?? "")
      .refine((v) => v.trim().length > 0, { message: "Required" }),
    price: z.coerce
      .number({ invalid_type_error: "Required" })
      .refine((val) => val >= 0, {
        message: "Required",
      }),
    quantity: z.coerce
      .number({ invalid_type_error: "Required" })
      .refine((val) => val >= 0, {
        message: "Required",
      }),
    total: z.coerce.number().optional(),
  })
  .refine(
    (data) => {
      if (data.activity === undefined || data.activity === "") {
        return false;
      }
      return true;
    },
    {
      message: "Required",
      path: ["activity"],
    }
  );
export type ActivityValue = {
  activity: string;
  unit: string | undefined;
  price: number | undefined;
  quantity: number | undefined;
  total: number | undefined;
};

interface ActivityProps {
  currency: string;
  onSubmit: () => void;
  initialValues: Partial<ActivityValue>;
  onActivityChange: (activity: string) => void;
  onUnitChange: (unit: string) => void;
  onPriceChange: (price: number | undefined) => void;
  onQuantityChange: (quantity: number | undefined) => void;
  type: "Mobilization" | "Reporting";
  onValidationChange: (isValid: boolean) => void;
}

export function Activity({
  currency,
  onSubmit,
  initialValues,
  onActivityChange,
  onUnitChange,
  onPriceChange,
  onQuantityChange,
  type,
  onValidationChange,
}: ActivityProps) {
  const { activity, unit, price, quantity } = initialValues;

  // Use a ref to track previous validation state
  const prevValidRef = useRef(false);

  const form = useForm<ActivityValue>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(activitySchema),
    defaultValues: {
      activity: activity || "",
      unit: (unit && unit?.charAt(0).toUpperCase() + unit?.slice(1)) || "",
      price: price,
      quantity: quantity,
    },
  });

  // Track form validity and notify parent only when it changes
  useEffect(() => {
    const currentIsValid = form.formState.isValid;

    // Only call onValidationChange when the validation state actually changes
    if (prevValidRef.current !== currentIsValid) {
      prevValidRef.current = currentIsValid;
      onValidationChange(currentIsValid);
    }
  }, [form.formState.isValid, onValidationChange]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6">
        <FormField
          control={form.control}
          name="activity"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Activity Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={
                    type === "Mobilization"
                      ? "e.g Sending 5 engineers to the field"
                      : "e.g Preparation of the results report"
                  }
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    onActivityChange(e.target.value);
                  }}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-wrap mt-2 gap-7">
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Unit</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      onUnitChange(value);
                    }}
                  >
                    <SelectTrigger className="w-[150px] bg-background">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Number",
                        "Meters",
                        "Lump sum",
                        "Days",
                        "Weeks",
                        "Months",
                        "Year",
                      ].map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price / Quantity / Total */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Unit Price</FormLabel>
                <FormControl>
                  <NumericFormat
                    className="max-w-[150px] min-w-[130px]"
                    customInput={Input}
                    thousandSeparator={true}
                    prefix={`${currency.toUpperCase()} `}
                    placeholder="Unit Price"
                    value={field.value}
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
                <FormLabel required>Quantity</FormLabel>
                <FormControl>
                  <NumericFormat
                    className="max-w-[100px] min-w-[100px]"
                    customInput={Input}
                    placeholder="Quantity"
                    value={field.value}
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
                <FormLabel>Computed Total</FormLabel>
                <FormControl>
                  <NumericFormat
                    disabled
                    className="max-w-[150px] min-w-[140px]"
                    customInput={Input}
                    thousandSeparator={true}
                    prefix={`${currency.toUpperCase()} `}
                    placeholder="Total"
                    value={
                      (form.watch("price") || 0) * (form.watch("quantity") || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
