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
import { priorities } from "../constants";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState } from "react";
import { Priority } from "../types";
import { DateRange } from "react-day-picker";

interface ProjectDetailsFormProps {
  isSubmitting: boolean;
}

export function ProjectDetailsForm({ isSubmitting }: ProjectDetailsFormProps) {
  const form = useFormContext();

  const [open, setOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<Priority>(
    priorities[0]
  );

  return (
    <FormSpacerWrapper>
      <Formheader title="Add Project Details" step={1} />
      <FormField
        control={form.control}
        name="projectName"
        rules={{ required: "Project name is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Enter Project name</FormLabel>
            <FormControl>
              <Input
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
        rules={{
          validate: (value: DateRange | undefined) => {
            if (!value?.from && !value?.to) return "Date range is required";
            if (!value?.from || !value?.to)
              return "Both start and end dates are required";
            if (value.to < value.from)
              return "End date cannot be before start date";
            return true;
          },
        }}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Start and End Date</FormLabel>
            <Popover>
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
                        {format(field.value.from, "LLL dd, y")} -{" "}
                        {format(field.value.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(field.value.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={field.value?.from}
                  selected={field.value}
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
      <FormField
        control={form.control}
        name="priority"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="w-[200px]">Choose a priority level</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-[200px] justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {selectedPriority ? (
                      <div className="flex items-center">
                        <selectedPriority.icon className="mr-2 h-4 w-4 shrink-0" />
                        {selectedPriority.label}
                      </div>
                    ) : (
                      <>Select Priority</>
                    )}

                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search priority level" />
                  <CommandList>
                    <CommandEmpty>None found.</CommandEmpty>
                    <CommandGroup>
                      {priorities.map((priority) => (
                        <CommandItem
                          value={priority.label}
                          key={priority.value}
                          onSelect={() => {
                            form.setValue("priority", priority.value);
                            setSelectedPriority(priority);
                            setOpen(false);
                          }}
                        >
                          <priority.icon
                            className={cn(
                              "mr-2 h-4 w-4",
                              priority.value === selectedPriority?.value
                                ? "opacity-100"
                                : "opacity-40"
                            )}
                          />
                          {priority.label}
                          <Check
                            className={cn(
                              "ml-auto",
                              priority.value === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormDescription>
              Helps signify to your team the urgency of this project
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSpacerWrapper>
  );
}
