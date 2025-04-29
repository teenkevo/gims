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
import { AnimatePresence, motion } from "framer-motion";

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
          className="sm:max-w-[500px]"
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
  const [subClassPopoverOpen, setSubClassPopoverOpen] = React.useState(false);
  // Restored useActionState
  const [state, dispatch, isPending] = React.useActionState(addService, null);

  // Add new state for the prefix
  const [prefix, setPrefix] = React.useState("");

  const form = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      code: "",
      testParameter: "",
      testMethods: [],
      sampleClass: "",
      sampleSubclass: "",
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

  const selectedSampleClass = sampleClasses.find(
    (s) => s._id === form.getValues("sampleClass")
  );

  const selectedSampleSubClass = selectedSampleClass?.subclasses?.find(
    (s) => s.key === form.getValues("sampleSubclass")
  );

  console.log(selectedSampleSubClass);

  // Update the prefix when standard changes
  React.useEffect(() => {
    setPrefix(
      selectedSampleSubClass?.key ? `${selectedSampleSubClass.key}/` : ""
    );
    // If there's an existing code value, we need to handle it
    const currentCode = form.getValues("code");
    if (currentCode && selectedSampleClass?.name) {
      // Remove any existing prefix and set new value
      const codeWithoutPrefix = currentCode.replace(/^[A-Z]+ /, "");
      form.setValue("code", `${selectedSampleClass.name} ${codeWithoutPrefix}`);
    }
  }, [form.watch("sampleSubclass")]);

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
                        className={cn(
                          "w-auto justify-between",
                          !field.value && "text-muted-foreground"
                        )}
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
          <FormField
            control={form.control}
            name="sampleSubclass"
            rules={{ required: "Please select a sample subclass" }}
            render={({ field }) => (
              <AnimatePresence mode="wait">
                {form.watch("sampleClass") && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FormItem className="flex flex-col">
                      <FormLabel className="py-1" required>
                        Sample Subclass
                      </FormLabel>
                      <Popover
                        open={subClassPopoverOpen}
                        onOpenChange={setSubClassPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              disabled={isPending}
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-auto justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <div className="flex items-center justify-between w-full">
                                {field.value
                                  ? (() => {
                                      const selectedSampleSubClass =
                                        selectedSampleClass?.subclasses?.find(
                                          (s) => s.key === field.value
                                        );
                                      return selectedSampleSubClass?.name &&
                                        selectedSampleSubClass.name.length > 40
                                        ? `${selectedSampleSubClass.name.substring(0, 40)}...`
                                        : selectedSampleSubClass?.name;
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
                              <CommandInput placeholder="Search sample subclass..." />
                              <CommandEmpty>
                                No sample subclass found.
                              </CommandEmpty>
                              <CommandGroup>
                                {selectedSampleClass?.subclasses?.map(
                                  (sampleSubClass) => {
                                    return (
                                      <CommandItem
                                        disabled={isPending}
                                        value={sampleSubClass.name || ""}
                                        key={sampleSubClass.key}
                                        onSelect={() => {
                                          form.setValue(
                                            "sampleSubclass",
                                            sampleSubClass.key || ""
                                          );
                                          setPopoverOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            sampleSubClass.key === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        <span className="max-w-[300px] truncate">
                                          {sampleSubClass.name}
                                        </span>
                                      </CommandItem>
                                    );
                                  }
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            rules={{ required: "Code is required" }}
            render={({ field }) => (
              <AnimatePresence mode="wait">
                {form.watch("sampleSubclass") && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex " required>
                        Service Code
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          {prefix && (
                            <div className="absolute text-sm left-3 top-1/2 -translate-y-1/2 font-bold select-none">
                              {prefix}
                            </div>
                          )}
                          <Input
                            disabled={isPending}
                            placeholder="01"
                            {...field}
                            value={field.value.replace(prefix, "")}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              field.onChange(prefix + newValue);
                            }}
                            className={cn(
                              prefix &&
                                "pl-[calc(0.5rem_+_var(--prefix-length))]"
                            )}
                            style={
                              {
                                "--prefix-length": `${prefix.length}ch`,
                              } as React.CSSProperties
                            }
                            autoFocus
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </motion.div>
                )}
              </AnimatePresence>
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
