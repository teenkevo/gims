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
import React, { useState } from "react";
import { z } from "zod";
import { useUpdateProjectDates } from "../api/use-update-project-dates";
import { revalidateProject } from "@/lib/actions";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { mutation } = useUpdateProjectDates();

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

  const handleUpdateProjectDates = async (dateRange: {
    from: Date;
    to: Date;
  }) => {
    setIsSubmitting(true);
    const result = await mutation.mutateAsync({
      json: {
        dateRange: {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
        },
        projectId,
      },
    });

    if (result) {
      revalidateProject(projectId).then(() => {
        toast.success("Project dates have been updated");
        setIsSubmitting(false);
      });
    } else {
      toast.error("Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <SingleFieldForm
      title={title}
      description={description}
      learnMoreLink={learnMoreLink}
      learnMoreText={learnMoreText}
      savable={savable}
      fieldName={fieldName}
      initialValue={initialValue}
      onSubmit={handleUpdateProjectDates}
      isSubmitting={isSubmitting}
      validation={dateRangeSchema}
      renderField={(form) => (
        <FormField
          control={form.control as Control<FieldValues, any, FieldValues>}
          name={fieldName}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    disabled={isSubmitting}
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
