"use client";
// core
import { format } from "date-fns";
import { useFormContext } from "react-hook-form";

// icons
import { CalendarIcon } from "@radix-ui/react-icons";

// utils
import { cn } from "@/lib/utils";

// components
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import FormSpacerWrapper from "@/components/form-spacer-wrapper";
import Formheader from "@/components/form-header";

interface ProjectDetailsFormProps {
  isSubmitting: boolean;
}

export function ProjectDetailsForm({ isSubmitting }: ProjectDetailsFormProps) {
  const form = useFormContext();

  return (
    <FormSpacerWrapper>
      <Formheader title="Add Project Details" step={1} />
      <FormField
        control={form.control}
        name="projectName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Enter Project name</FormLabel>
            <FormControl>
              <Input
                autoFocus
                disabled={isSubmitting}
                placeholder="e.g. Nakawa Power Lines"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Keep the project name short and self-descriptive.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="dateRange"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Start and End Date</FormLabel>
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
                  {field.value.from ? (
                    field.value.to ? (
                      <>
                        {format(field.value.from, "LLL dd, y")} -{" "}
                        {format(field.value.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(field.value.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
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
            <FormDescription>Select the start and end date</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSpacerWrapper>
  );
}
