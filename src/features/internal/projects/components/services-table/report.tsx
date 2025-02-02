"use client";
// core
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

const reportingSchema = z
  .object({
    activity: z
      .string()
      .min(1, { message: "Please enter the reporting activity" })
      .optional()
      .or(z.literal("")),
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
export type ReportingValue = {
  activity: string;
};

interface ReportingProps {
  onSubmit: () => void;
  initialValues: Partial<ReportingValue>;
  onReportingChange: (activity: string) => void;
  isRowSelected: Boolean;
}

export function Reporting({
  onSubmit,
  initialValues,
  onReportingChange,
  isRowSelected,
}: ReportingProps) {
  const { activity } = initialValues;

  const form = useForm<ReportingValue>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(reportingSchema),
    defaultValues: {
      activity,
    },
  });

  useEffect(() => {
    if (isRowSelected) {
      form.trigger("activity");
    } else {
      form.clearErrors();
      // form.resetField("activity");
    }
  }, [isRowSelected]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-7">
        <FormField
          control={form.control}
          name="activity"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  disabled={!isRowSelected}
                  placeholder="e.g. Report preparation"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    onReportingChange(e.target.value);
                  }}
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
