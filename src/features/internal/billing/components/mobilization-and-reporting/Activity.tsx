// core
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { NumericFormat } from "react-number-format";

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
import { useEffect } from "react";

const activitySchema = z
  .object({
    activity: z
      .string()
      .min(1, { message: "Please enter the reporting activity" })
      .optional()
      .or(z.literal("")),
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
  price: number;
  quantity: number;
  total: number | undefined;
};

interface ActivityProps {
  onSubmit: () => void;
  initialValues: Partial<ActivityValue>;
  onActivityChange: (activity: string) => void;
  onPriceChange: (price: number | undefined) => void;
  onQuantityChange: (quantity: number | undefined) => void;
  type: "Mobilization" | "Reporting";
  onValidationChange: (isValid: boolean) => void; // New prop
}

export function Activity({
  onSubmit,
  initialValues,
  onActivityChange,
  onPriceChange,
  onQuantityChange,
  type,
  onValidationChange,
}: ActivityProps) {
  const { activity, price, quantity } = initialValues;

  const form = useForm<ActivityValue>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(activitySchema),
    defaultValues: {
      activity,
      price,
      quantity,
    },
  });

  // Track form validity and notify parent
  useEffect(() => {
    onValidationChange(form.formState.isValid); // Call the parent's callback with the validation state
  }, [form.formState.isValid, onValidationChange]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6">
        <FormField
          control={form.control}
          name="activity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{type} Activity Descriptions</FormLabel>
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
        <div className="flex flex-wrap mt-5 gap-7">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Price</FormLabel>
                <FormControl>
                  <NumericFormat
                    className="max-w-[150px] min-w-[130px] text-[16px] md:text-sm"
                    customInput={Input}
                    thousandSeparator={true}
                    prefix={"UGX "}
                    placeholder="Add a price"
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
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <NumericFormat
                    className="max-w-[100px] min-w-[100px] text-[16px] md:text-sm"
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
                    className="max-w-[150px] min-w-[140px] text-[16px] md:text-sm"
                    customInput={Input}
                    thousandSeparator={true}
                    prefix={"UGX "}
                    placeholder="Total"
                    value={form?.watch("price") * form?.watch("quantity")}
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
