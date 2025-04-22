"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { addService } from "@/lib/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronsUpDown, PlusCircleIcon } from "lucide-react";
import {
  ALL_SAMPLE_CLASSES_QUERYResult,
  ALL_STANDARDS_QUERYResult,
  ALL_TEST_METHODS_QUERYResult,
} from "../../../../../sanity.types";
import { MultiSelectTestMethodField } from "./multi-select-test-methods";
import { CommandItem } from "@/components/ui/command";
import { CommandGroup } from "@/components/ui/command";
import { CommandInput, CommandList } from "@/components/ui/command";
import { PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Command } from "@/components/ui/command";

interface ServiceType {
  code: string;
  testParameter: string;
  testMethods: string[];
  sampleClass: string;
  status: string;
}

export function CreateServiceDialog({
  sampleClasses,
  testMethods,
}: {
  standards: ALL_STANDARDS_QUERYResult;
  sampleClasses: ALL_SAMPLE_CLASSES_QUERYResult;
  testMethods: ALL_TEST_METHODS_QUERYResult;
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="sm:w-auto mb-5" variant="default">
            <PlusCircleIcon className="h-5 w-5 md:mr-2" />
            <span className="hidden sm:inline">Add New Service</span>
          </Button>
        </DialogTrigger>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>Create Service</DialogTitle>
          </DialogHeader>
          <ServiceForm
            setOpen={setOpen}
            testMethods={testMethods}
            sampleClasses={sampleClasses}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="sm:w-auto mb-5" variant="default">
          <PlusCircleIcon className="h-5 w-5 md:mr-2" />
          <span className="hidden sm:inline">Add New Service</span>
        </Button>
      </DialogTrigger>
      <DrawerContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DrawerHeader className="text-left">
          <DrawerTitle>Create Service</DrawerTitle>
        </DrawerHeader>

        <ServiceForm
          setOpen={setOpen}
          testMethods={testMethods}
          sampleClasses={sampleClasses}
        />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ServiceForm({
  setOpen,
  testMethods,
  sampleClasses,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  testMethods: ALL_TEST_METHODS_QUERYResult;
  sampleClasses: ALL_SAMPLE_CLASSES_QUERYResult;
}) {
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  // Restored useActionState
  const [state, dispatch, isPending] = React.useActionState(addService, null);

  const form = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      code: "",
      testParameter: "",
      testMethods: [],
      sampleClass: "",
      status: "active",
    },
  });

  const onSubmit = (data: ServiceType) => {
    const formData = new FormData();
    formData.append("code", data.code);
    formData.append("testParameter", data.testParameter);
    data.testMethods.forEach((testMethod) =>
      formData.append(
        "testMethods",
        JSON.stringify({
          testMethod,
        })
      )
    );
    formData.append("sampleClass", data.sampleClass);
    formData.append("status", data.status);
    React.startTransition(() => dispatch(formData)); // Use dispatch instead of createProject
  };

  React.useEffect(() => {
    if (state?.status === "ok") {
      toast.success("Service has been added");
      setOpen(false);
    } else if (state?.status === "error") {
      toast.error("Something went wrong");
    }
  }, [state]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`max-h-[500px] overflow-y-auto`}
      >
        <div className="space-y-8  px-4 md:px-1 py-4 ">
          <FormField
            control={form.control}
            name="code"
            rules={{ required: "Code is required" }}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="flex " required>
                  Service Code
                </FormLabel>
                <FormControl>
                  <Input
                    autoFocus
                    disabled={isPending}
                    placeholder="e.g. RO/01"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="testParameter"
            rules={{ required: "Test parameter is required" }}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="flex " required>
                  Test Parameter
                </FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isPending}
                    placeholder="e.g. Bulk Density / Unit weight"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sampleClass"
            rules={{ required: "Please select a sample class" }}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="py-1" required>
                  Sample Class
                </FormLabel>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        disabled={isPending}
                        variant="outline"
                        role="combobox"
                        className={cn("w-auto justify-between")}
                      >
                        <div className="flex items-center justify-between w-full">
                          {field.value
                            ? (() => {
                                const selectedSampleClass = sampleClasses.find(
                                  (s) => s._id === field.value
                                );
                                return selectedSampleClass?.name &&
                                  selectedSampleClass.name.length > 35
                                  ? `${selectedSampleClass.name.substring(0, 35)}...`
                                  : selectedSampleClass?.name;
                              })()
                            : "Select a sample class"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </div>
                      </Button>
                    </FormControl>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0" align="start">
                    <Command>
                      <CommandList>
                        <CommandInput placeholder="Search sample class..." />
                        <CommandEmpty>No sample class found.</CommandEmpty>
                        <CommandGroup>
                          {sampleClasses.map((sampleClass) => (
                            <CommandItem
                              disabled={isPending}
                              value={sampleClass.name || ""}
                              key={sampleClass._id}
                              onSelect={() => {
                                form.setValue("sampleClass", sampleClass._id);
                                setPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  sampleClass._id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <span className="max-w-[300px] truncate">
                                {sampleClass.name}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="px-4 md:px-1 mt-5 mb-20">
          <MultiSelectTestMethodField
            control={form.control}
            name="testMethods"
            testMethods={testMethods}
            label="Test Methods"
            description="These are the methods available for carrying out this service"
          />
        </div>

        <FormSubmitButton text="Save" isSubmitting={isPending} />
      </form>
    </Form>
  );
}
