"use client";
// core
import { NumericFormat } from "react-number-format";
import { format } from "date-fns";
import { useForm } from "react-hook-form";

// icons
import { CalendarIcon } from "@radix-ui/react-icons";

// utils
import { cn } from "@/lib/utils";

// components
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

export function FeatureComplexForm() {
  const form = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
  });

  return (
    <div className="absolute right-0 h-[500px] w-[80%] mx-10 p-4 border rounded-lg bg-secondary/40 top-10 origin-top transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]">
      <Form {...form}>
        <form className="space-y-8">
          <FormField
            control={form.control}
            name="partialBillToggle"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between space-x-4 rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Enable partial billing</FormLabel>
                  <FormDescription>
                    When this option is turned on, the client is required to
                    make an upfront payment before the project commences.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {form.watch("partialBillToggle") && (
            <>
              <FormField
                control={form.control}
                name="partialBill"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upfront amount to be paid</FormLabel>
                    <FormControl>
                      <NumericFormat
                        customInput={Input}
                        thousandSeparator={true}
                        prefix={"UGX "}
                        placeholder="e.g. UGX 200,000"
                        value={field.value}
                        onValueChange={(target) => {
                          field.onChange(target.floatValue);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Amount billed before the project starts. Must be less than{" "}
                      {
                        <NumericFormat
                          thousandSeparator={true}
                          displayType="text"
                          prefix={"UGX "}
                          value={10000000}
                          className="text-xs font-bold mr-1"
                        />
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="partialBillDueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Upfront invoice due date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              " pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a due date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </form>
      </Form>
    </div>
  );
}
