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
import { updateTestMethod } from "@/lib/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronsUpDown, Pencil, Plus } from "lucide-react";
import {
  ALL_STANDARDS_QUERYResult,
  ALL_TEST_METHODS_QUERYResult,
} from "../../../../../../../../sanity.types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface EditTestMethodType {
  code: string;
  description: string;
  standard: string;
}

export function EditTestMethodDialog({
  open,
  onClose,
  standards,
  testMethod,
}: {
  open: boolean;
  onClose: () => void;
  standards: ALL_STANDARDS_QUERYResult;
  testMethod: ALL_TEST_METHODS_QUERYResult[number];
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>Edit test method</DialogTitle>
          </DialogHeader>

          <TestMethodForm
            testMethod={testMethod}
            standards={standards}
            onClose={onClose}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit Test Method</DrawerTitle>
        </DrawerHeader>

        <TestMethodForm
          testMethod={testMethod}
          standards={standards}
          onClose={onClose}
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

function TestMethodForm({
  standards,
  testMethod,
  onClose,
}: {
  standards: ALL_STANDARDS_QUERYResult;
  testMethod: ALL_TEST_METHODS_QUERYResult[number];
  onClose: () => void;
}) {
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  // Restored useActionState
  const [state, dispatch, isPending] = React.useActionState(
    updateTestMethod,
    null
  );

  const form = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      code: testMethod.code || "",
      description: testMethod.description || "",
      standard: testMethod.standard?._id || "",
    },
  });

  const onSubmit = (data: EditTestMethodType) => {
    const formData = new FormData();
    formData.append("code", data.code);
    formData.append("description", data.description);
    formData.append("standard", data.standard);
    formData.append("testMethodId", testMethod._id);
    React.startTransition(() => dispatch(formData)); // Use dispatch instead of createProject
  };

  React.useEffect(() => {
    if (state?.status === "ok") {
      toast.success("Standard has been updated");
      onClose();
    } else if (state?.status === "error") {
      toast.error("Something went wrong");
    }
  }, [state]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`space-y-8 h-[400px] px-4 md:px-0 py-4`}
      >
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
                  disabled={isPending}
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
                  disabled={isPending}
                  placeholder="Add short description"
                  {...field}
                  className="h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                      disabled={isPending}
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
                            disabled={isPending}
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
        <FormSubmitButton text="Save" isSubmitting={isPending} />
      </form>
    </Form>
  );
}
