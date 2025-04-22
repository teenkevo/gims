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
import { addTestMethod } from "@/lib/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { motion } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import { CommandEmpty } from "@/components/ui/command";
import { CommandInput } from "@/components/ui/command";
import { CommandList } from "@/components/ui/command";
import { ALL_STANDARDS_QUERYResult } from "../../../../../sanity.types";
import FileUpload from "@/components/file-upload";

interface TestMethodType {
  code: string;
  description: string;
  standard: string;
  documents: File[];
}

export function CreateTestMethodDialog({
  standards,
  trigger,
}: {
  standards: ALL_STANDARDS_QUERYResult;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger ? (
            trigger
          ) : (
            <Button variant="outline" className="text-sm flex items-center">
              <Plus className="h-4 w-4 mr-2 text-primary" />
              Add new
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Test Method</DialogTitle>
          </DialogHeader>

          <TestMethodForm setOpen={setOpen} standards={standards} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="outline" className="text-sm flex items-center">
            <Plus className="h-4 w-4 mr-2 text-primary" />
            Add new
          </Button>
        )}
      </DialogTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Create Test Method</DrawerTitle>
        </DrawerHeader>

        <TestMethodForm setOpen={setOpen} standards={standards} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function TestMethodForm({
  standards,
  setOpen,
}: {
  standards: ALL_STANDARDS_QUERYResult;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false); // Local loading state

  // Restored useActionState
  const [state, dispatch, isPending] = React.useActionState(
    addTestMethod,
    null
  );

  const form = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      code: "",
      description: "",
      standard: "",
      documents: [],
    },
  });

  const onSubmit = async (data: TestMethodType) => {
    const formData = new FormData();
    formData.append("code", data.code);
    formData.append("description", data.description);
    formData.append("standard", data.standard);
    data.documents.forEach((file) => {
      formData.append("files", file);
    });

    setLoading(true);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    setLoading(false);

    result?.files?.forEach(
      (file: { fileId: string; url: string; fileName: string }) => {
        formData.append("documents", file.fileId);
      }
    );

    formData.delete("files");

    React.startTransition(() => dispatch(formData)); // Use dispatch instead of createProject
  };

  React.useEffect(() => {
    if (state?.status === "ok") {
      toast.success("Test method has been added");
      setOpen(false);
    } else if (state?.status === "error") {
      toast.error("Something went wrong");
    }
  }, [state]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`space-y-8 h-[500px] px-4 md:px-1 py-4 overflow-y-auto`}
      >
        <FormField
          control={form.control}
          name="standard"
          rules={{ required: "Please select a standard" }}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="py-1" required>
                Standard
              </FormLabel>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      disabled={isPending || loading}
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-auto justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key="standardSelection"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center justify-between w-full"
                        >
                          {field.value
                            ? (() => {
                                const selectedStandard = standards.find(
                                  (s) => s._id === field.value
                                );
                                return selectedStandard?.name &&
                                  selectedStandard.name.length > 35
                                  ? `${selectedStandard.name.substring(0, 35)}...`
                                  : selectedStandard?.name;
                              })()
                            : "Select a standard"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </motion.div>
                      </AnimatePresence>
                    </Button>
                  </FormControl>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <Command>
                    <CommandList>
                      <CommandInput placeholder="Search standard..." />
                      <CommandEmpty>No standard found.</CommandEmpty>
                      <CommandGroup>
                        {standards.map((standard) => (
                          <CommandItem
                            disabled={isPending || loading}
                            value={standard.name || ""}
                            key={standard._id}
                            onSelect={() => {
                              form.setValue("standard", standard._id);
                              setPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                standard._id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <span className="max-w-[300px] truncate">
                              {standard.acronym} - {standard.name}
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
          name="code"
          rules={{ required: "Code is required" }}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="flex " required>
                Code
              </FormLabel>
              <FormControl>
                <Input
                  disabled={isPending || loading}
                  placeholder="e.g. BS EN 10025-2"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="flex ">Description</FormLabel>
              <FormControl>
                <Textarea
                  disabled={isPending || loading}
                  placeholder="Add short description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="documents"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="flex ">Upload File</FormLabel>
              <FormControl>
                <FileUpload
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  maxSize={20}
                  onFilesChange={(files) => {
                    field.onChange(files);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormSubmitButton text="Save" isSubmitting={isPending || loading} />
      </form>
    </Form>
  );
}
