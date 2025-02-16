"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

// Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  ArrowRightCircle,
  Check,
  ChevronsUpDown,
  PlusCircleIcon,
} from "lucide-react";
import { isValidPhoneNumber } from "react-phone-number-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { RadioGroup } from "@/components/ui/radio-group";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { motion } from "framer-motion";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Popover } from "@/components/ui/popover";
import { AnimatePresence } from "framer-motion";
import { CommandInput } from "@/components/ui/command";
import { CommandEmpty } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { CommandGroup } from "@/components/ui/command";
import {
  ALL_CLIENTS_QUERYResult,
  ALL_CONTACTS_QUERYResult,
} from "../../../../../sanity.types";
import { useCreateContact } from "@/features/customer/clients/api/use-create-contact";
import { ButtonLoading } from "@/components/button-loading";
import { Badge } from "@/components/ui/badge";
import { revalidateProject } from "@/lib/actions";
import { useAddClientToProject } from "@/features/customer/clients/api/use-add-client-to-project";

const formSchema = z
  .object({
    clientType: z.enum(["new", "existing"], {
      required_error: "Required",
    }),
    existingClient: z.string().optional(),
    newClientName: z.string().min(1, "Required").optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (
        data.clientType === "new" &&
        (data.newClientName === undefined || data.newClientName === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Please enter the contact name",
      path: ["name"],
    }
  )
  .refine(
    (data) => {
      if (data.clientType === "existing" && data.existingClient === undefined) {
        return false;
      }
      return true;
    },
    {
      message: "Please select a client",
      path: ["existingClient"],
    }
  );

export function CreateClientDialog({
  projectId,
  existingClients,
}: {
  projectId: string;
  existingClients: ALL_CLIENTS_QUERYResult;
}) {
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutation } = useAddClientToProject();

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientType: "new",
      existingClient: undefined,
      newClientName: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formattedData = {
      projectId,
      clientType: values.clientType,
      existingClient:
        values.clientType === "existing" ? values.existingClient : undefined,
      newClientName:
        values.clientType === "new" ? values.newClientName : undefined,
    };

    const result = await mutation.mutateAsync({ json: formattedData });

    if (result) {
      revalidateProject(projectId).then(() => {
        form.reset();
        setOpen(false);
        toast.success("Client has been associated with the project");
        setIsSubmitting(false);
      });
    } else {
      toast.error("Something went wrong");
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
          form.reset(); // Reset the form when the dialog opens
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircleIcon className="h-5 w-5 mr-2 text-primary" />
          Add Client To Project
        </Button>
      </DialogTrigger>

      <DialogContent aria-describedby={undefined} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Client To Project</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="clientType"
              render={({ field }) => (
                <FormItem className="space-y-3 my-4">
                  <FormControl>
                    <RadioGroup
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="new" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Create a new client
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="existing" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Choose from already existing clients
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("clientType") === "existing" ? (
              <FormField
                control={form.control}
                name="existingClient"
                render={({ field }) => (
                  <FormItem className="py-4">
                    <Popover
                      open={popoverOpen}
                      onOpenChange={() => setPopoverOpen(!popoverOpen)}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            disabled={isSubmitting}
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-auto justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <AnimatePresence mode="wait">
                              <motion.div
                                key="clientSelection"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center justify-between w-full"
                              >
                                {field.value
                                  ? existingClients.find(
                                      (c) => c._id === field.value
                                    )?.name
                                  : "Select an existing client"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </motion.div>
                            </AnimatePresence>
                          </Button>
                        </FormControl>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto p-0" align="start">
                        <Command>
                          <CommandList>
                            <CommandInput placeholder="Search client..." />
                            <CommandEmpty>No client found.</CommandEmpty>
                            <CommandGroup>
                              {existingClients.map((client) => (
                                <CommandItem
                                  disabled={isSubmitting}
                                  value={client.name || ""}
                                  key={client._id}
                                  onSelect={() => {
                                    form.setValue("existingClient", client._id);
                                    setPopoverOpen(false);
                                    form.clearErrors("existingClient");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      client._id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {client.name}
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
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="newClientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isSubmitting}
                          placeholder="e.g. Paragon Construction (SG) Limited"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter className="py-2">
              <div className="flex items-center">
                <div className="relative after:pointer-events-none after:absolute after:inset-px after:rounded-[11px] after:shadow-highlight after:shadow-white/10 focus-within:after:shadow-[#77f6aa] after:transition">
                  {isSubmitting ? (
                    <ButtonLoading />
                  ) : (
                    <Button type="submit" variant="default">
                      Add client to project
                      <ArrowRightCircle className="ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
