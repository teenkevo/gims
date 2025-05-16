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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowRightCircle, BriefcaseBusiness, ChevronsUpDown, PlusCircleIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { motion } from "framer-motion";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { AnimatePresence } from "framer-motion";
import { CommandInput } from "@/components/ui/command";
import { CommandEmpty } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { CommandGroup } from "@/components/ui/command";
import type { ALL_CLIENTS_QUERYResult, PROJECT_BY_ID_QUERYResult } from "../../../../../sanity.types";
import { ButtonLoading } from "@/components/button-loading";
import { Badge } from "@/components/ui/badge";
import { revalidateProject } from "@/lib/actions";
import { useAddClientToProject } from "@/features/customer/clients/api/use-add-client-to-project";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

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
      if (data.clientType === "new" && (data.newClientName === undefined || data.newClientName === "")) {
        return false;
      }
      return true;
    },
    {
      message: "Please enter the contact name",
      path: ["newClientName"],
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
  projectClients,
}: {
  projectId: string;
  existingClients: ALL_CLIENTS_QUERYResult;
  projectClients: PROJECT_BY_ID_QUERYResult[number]["clients"];
}) {
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

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
      existingClient: values.clientType === "existing" ? values.existingClient : undefined,
      newClientName: values.clientType === "new" ? values.newClientName : undefined,
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

  const triggerButton = (
    <Button variant="outline">
      <PlusCircleIcon className="h-5 w-5 mr-2 text-primary" />
      Add Client To Project
    </Button>
  );

  const content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="clientType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  disabled={isSubmitting}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex items-center justify-evenly space-x-4 my-5"
                >
                  <FormItem className="w-1/2">
                    <FormControl>
                      <RadioGroupItem value="new" className="sr-only peer" id="new-client" />
                    </FormControl>
                    <FormLabel
                      htmlFor="new-client"
                      className="flex flex-col items-center justify-center flex-1 h-25 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <PlusCircleIcon className="h-8 w-8 mb-2" />
                      <span className="text-sm text-center font-medium">Create New</span>
                    </FormLabel>
                  </FormItem>

                  <FormItem className="w-1/2">
                    <FormControl>
                      <RadioGroupItem value="existing" className="sr-only peer" id="existing-client" />
                    </FormControl>
                    <FormLabel
                      htmlFor="existing-client"
                      className="flex flex-col items-center justify-center flex-1 h-25 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <BriefcaseBusiness className="h-8 w-8 mb-2" />
                      <span className="text-sm font-medium">Choose Existing</span>
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
              <FormItem className="flex flex-col">
                <FormLabel className="py-1">Existing contacts</FormLabel>
                <Popover open={popoverOpen} onOpenChange={() => setPopoverOpen(!popoverOpen)}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        disabled={isSubmitting}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-[350px] md:w-[450px] justify-between",
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
                            <span className="truncate">
                              {field.value
                                ? existingClients.find((c) => c._id === field.value)?.name
                                : "Select an existing client"}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </motion.div>
                        </AnimatePresence>
                      </Button>
                    </FormControl>
                  </PopoverTrigger>

                  <PopoverContent className="w-[350px] md:w-[400px] p-0" align="start">
                    <Command>
                      <CommandList>
                        <CommandInput placeholder="Search client..." />
                        <CommandEmpty>No client found.</CommandEmpty>
                        <CommandGroup>
                          {existingClients.map((client) => {
                            const isAdded = projectClients?.some((c) => c._id === client._id);
                            return (
                              <CommandItem
                                disabled={isSubmitting || isAdded}
                                value={client.name || ""}
                                key={client._id}
                                className="flex items-center justify-between"
                                onSelect={() => {
                                  form.setValue("existingClient", client._id);
                                  setPopoverOpen(false);
                                  form.clearErrors("existingClient");
                                }}
                              >
                                <span className="truncate">{client.name}</span>
                                {isAdded && (
                                  <Badge className="text-primary" variant="secondary">
                                    Already added
                                  </Badge>
                                )}
                              </CommandItem>
                            );
                          })}
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
                    <Input disabled={isSubmitting} placeholder="e.g. Paragon Construction (SG) Limited" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="py-2">
          <div className="flex items-center">
            <div className="relative after:pointer-events-none after:absolute after:inset-px after:rounded-[11px] after:shadow-highlight after:shadow-white/10 focus-within:after:shadow-[#77f6aa] after:transition w-full">
              {isSubmitting ? (
                <ButtonLoading />
              ) : (
                <Button type="submit" variant="default" className="w-full">
                  Add client to project
                  <ArrowRightCircle className="ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );

  if (isDesktop) {
    return (
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (isOpen) {
            form.reset();
          }
        }}
      >
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Add Client To Project</DialogTitle>
            <DialogDescription>Associate a new / existing client with this project</DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
          form.reset();
        }
      }}
    >
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent aria-describedby={undefined}>
        <DrawerHeader className="gap-3 text-left">
          <DrawerTitle>Add Client To Project</DrawerTitle>
          <DrawerDescription>Associate a new / existing client with this project</DrawerDescription>
        </DrawerHeader>
        <div className=" py-4 px-4">{content}</div>
      </DrawerContent>
    </Drawer>
  );
}
