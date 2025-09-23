import { SingleFieldForm } from "@/components/single-field-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { useActionState, useState } from "react";
import { z } from "zod";
import { useUpdateProjectDates } from "../api/use-update-project-dates";
import { revalidateProject, updateProjectDates } from "@/lib/actions";
import { Control, FieldValues } from "react-hook-form";

interface ProjectUpdateDatesFormProps {
  title: string;
  description?: string;
  learnMoreLink?: string;
  learnMoreText?: string;
  savable: boolean;
  fieldName: string;
  initialValue: any;
  projectId: string;
}

export default function ProjectUpdateDatesForm({
  title,
  description,
  learnMoreLink,
  learnMoreText,
  savable,
  fieldName,
  initialValue,
  projectId,
}: ProjectUpdateDatesFormProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const dateRangeSchema = z
    .object(
      {
        from: z.date().optional(),
        to: z.date().optional(),
      },
      {
        required_error: "Please select a date range",
      }
    )
    .superRefine((val, ctx) => {
      // Either both are empty, or both are present
      if (val.from && !val.to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["to"],
          message: "Select an end date too",
        });
      }
    });

  const action = async (_: any, formData: FormData) => {
    const result = await updateProjectDates(formData, projectId);
    if (result.status === "ok") {
      toast.success("Project dates have been updated");
    } else {
      toast.error("Something went wrong");
    }
    return result;
  };

  const [actionResult, dispatch, isPending] = useActionState(action, null);

  return (
    <SingleFieldForm
      title={title}
      description={description}
      learnMoreLink={learnMoreLink}
      learnMoreText={learnMoreText}
      savable={savable}
      fieldName={fieldName}
      initialValue={initialValue}
      action={dispatch}
      actionResult={actionResult}
      isSubmitting={isPending}
      validation={dateRangeSchema}
      renderField={(form) => (
        <FormField
          control={form.control as Control<FieldValues, any, FieldValues>}
          name={fieldName}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              {/* Hidden inputs to provide server action FormData keys */}
              <input
                type="hidden"
                name="dateFrom"
                value={field.value?.from ? field.value.from.toISOString() : ""}
              />
              <input
                type="hidden"
                name="dateTo"
                value={field.value?.to ? field.value.to.toISOString() : ""}
              />
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    disabled={isPending}
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value?.from ? (
                      field.value?.to ? (
                        <>
                          {format(field.value.from, isDesktop ? "PPPP" : "PP")}{" "}
                          - {format(field.value.to, isDesktop ? "PPPP" : "PP")}
                        </>
                      ) : (
                        format(field.value.from, isDesktop ? "PPPP" : "PP")
                      )
                    ) : (
                      <span>Set start date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={field.value.from}
                    selected={{
                      from: field.value.from!,
                      to: field.value.to,
                    }}
                    onSelect={field.onChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    ></SingleFieldForm>
  );
}
