"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { setProjectDateRange } from "@/lib/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { toast } from "sonner";
import type { ALL_PROJECTS_QUERYResult } from "../../../../../sanity.types";

interface DateRangeType {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export function SetDateRangeDialog({
  buttonText,
  icon,
  project,
  role,
}: {
  buttonText: string;
  icon: React.ReactNode;
  project: ALL_PROJECTS_QUERYResult[number];
  role: string;
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={role !== "admin"}
            size="sm"
            variant="outline"
            className="flex items-center"
          >
            {icon}
            {buttonText}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Project Dates</DialogTitle>
            <DrawerDescription>
              This configuration allows you to track the progression of your project
            </DrawerDescription>
          </DialogHeader>

          <DateRangeForm setOpen={setOpen} project={project} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={role !== "admin"}
          size="sm"
          variant="outline"
          className="flex items-center"
        >
          {icon}
          {buttonText}
        </Button>
      </DialogTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Set Project Dates</DrawerTitle>
          <DrawerDescription>
            This configuration allows you to track the progression of your project
          </DrawerDescription>
        </DrawerHeader>

        <DateRangeForm setOpen={setOpen} project={project} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function DateRangeForm({
  setOpen,
  project,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  project: ALL_PROJECTS_QUERYResult[number];
}) {
  const { _id, startDate, endDate } = project;
  // Restored useActionState
  const [state, dispatch, isPending] = React.useActionState(setProjectDateRange, null);

  const form = useForm({
    mode: "onChange",
    reValidateMode: "onBlur",
    defaultValues: {
      dateRange: {
        from: startDate ? new Date(startDate) : undefined,
        to: endDate ? new Date(endDate) : undefined,
      },
    },
  });

  const onSubmit = (data: DateRangeType) => {
    const formData = new FormData();
    if (data.dateRange.from && data.dateRange.to) {
      formData.append("dateFrom", data.dateRange.from.toISOString());
      formData.append("dateTo", data.dateRange.to.toISOString());
      formData.append("projectId", _id);
    } else {
      formData.append("projectId", _id);
    }
    React.startTransition(() => dispatch(formData)); // Use dispatch instead of createProject
  };

  React.useEffect(() => {
    if (state?.status === "ok") {
      toast.success("Project dates have been set");
      setOpen(false);
    } else if (state?.status === "error") {
      toast.error("Something went wrong");
    }
  }, [state]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-8 h-40 px-4 md:px-0 py-4`}>
        <FormField
          control={form.control}
          name="dateRange"
          rules={{
            validate: (value: DateRange | undefined) => {
              if (value?.from && !value?.to)
                return "End date is required if start date is selected";
              if (!value?.from && !value?.to) return true; // Date range is not required
              return true;
            },
          }}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="flex " required>
                Start and End Date
              </FormLabel>
              <FormControl>
                <div className="relative w-full">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
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
                  {(field.value.from || field.value.to) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => field.onChange({ from: undefined, to: undefined })}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                      title="Clear dates"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormSubmitButton text="Save" isSubmitting={isPending} />
      </form>
    </Form>
  );
}
