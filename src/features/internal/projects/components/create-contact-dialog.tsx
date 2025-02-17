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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowRightCircle, ChevronsUpDown } from "lucide-react";
import { isValidPhoneNumber } from "react-phone-number-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { motion } from "framer-motion";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { AnimatePresence } from "framer-motion";
import { CommandInput } from "@/components/ui/command";
import { CommandEmpty } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { CommandGroup } from "@/components/ui/command";
import type { ALL_CONTACTS_QUERYResult } from "../../../../../sanity.types";
import { useCreateContact } from "@/features/customer/clients/api/use-create-contact";
import { ButtonLoading } from "@/components/button-loading";
import { Badge } from "@/components/ui/badge";
import { revalidateProject } from "@/lib/actions";
import { PlusCircleIcon, Users } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const formSchema = z
  .object({
    contactType: z.enum(["new", "existing"], {
      required_error: "Required",
    }),
    existingContact: z.string().optional(),
    name: z.string().min(1, "Required").optional().or(z.literal("")),
    email: z
      .string()
      .email({ message: "Enter valid email" })
      .min(1, "Required")
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .refine(isValidPhoneNumber, {
        message: "Please enter a valid phone number",
      })
      .optional(),
    designation: z.string().min(1, "Required").optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (
        data.contactType === "new" &&
        (data.name === undefined || data.name === "")
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
      if (
        data.contactType === "new" &&
        (data.email === undefined || data.email === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Please enter the contact email address",
      path: ["email"],
    }
  )
  .refine(
    (data) => {
      if (
        data.contactType === "new" &&
        (data.phone === undefined || data.phone === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Please enter the contact phone number",
      path: ["phone"],
    }
  )
  .refine(
    (data) => {
      if (
        data.contactType === "existing" &&
        data.existingContact === undefined
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Please select a contact",
      path: ["existingContact"],
    }
  )
  .refine(
    (data) => {
      if (
        data.contactType === "new" &&
        (data.designation === undefined || data.designation === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Please enter the contact designation",
      path: ["designation"],
    }
  );

export function CreateContactDialog({
  projectId,
  clientId,
  existingContacts,
  projectContacts,
}: {
  projectId: string;
  clientId: string;
  existingContacts: ALL_CONTACTS_QUERYResult;
  projectContacts: ALL_CONTACTS_QUERYResult;
}) {
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutation } = useCreateContact();

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactType: "new",
      existingContact: undefined,
      name: "",
      email: "",
      phone: "",
      designation: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formattedData = {
      projectId,
      clientId,
      contactType: values.contactType,
      existingContact:
        values.contactType === "existing" ? values.existingContact : undefined,
      name: values.contactType === "new" ? values.name : undefined,
      email: values.contactType === "new" ? values.email : undefined,
      phone: values.contactType === "new" ? values.phone : undefined,
      designation:
        values.contactType === "new" ? values.designation : undefined,
    };

    const result = await mutation.mutateAsync({ json: formattedData });

    if (result) {
      revalidateProject(projectId).then(() => {
        form.reset();
        setOpen(false);
        toast.success("Contact has been added to the project");
        setIsSubmitting(false);
      });
    } else {
      toast.error("Something went wrong");
      setIsSubmitting(false);
    }
  }

  const isMobile = useMediaQuery("(max-width: 640px)");

  return isMobile ? (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
          form.reset();
        }
      }}
    >
      <SheetTrigger asChild>
        <Button variant="outline">
          <PlusCircleIcon className="h-5 w-5 mr-2 text-primary" />
          Add Contact
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh]">
        <SheetHeader>
          <SheetTitle>Add Contact Person</SheetTitle>
          <SheetDescription>
            Associate a new / existing contact person with this project
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="contactType"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormControl>
                    <RadioGroup
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center justify-evenly space-x-4 my-5"
                    >
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem
                            value="new"
                            className="sr-only peer"
                            id="new-contact"
                          />
                        </FormControl>
                        <FormLabel
                          htmlFor="new-contact"
                          className="flex flex-col items-center justify-center w-40 h-25 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <PlusCircleIcon className="h-8 w-8 mb-2" />
                          <span className="text-sm text-center font-medium">
                            Create New
                          </span>
                        </FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem
                            value="existing"
                            className="sr-only peer"
                            id="existing-contact"
                          />
                        </FormControl>
                        <FormLabel
                          htmlFor="existing-contact"
                          className="flex flex-col items-center justify-center w-40 h-25 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <Users className="h-8 w-8 mb-2" />
                          <span className="text-sm font-medium">
                            Choose Existing
                          </span>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("contactType") === "existing" ? (
              <FormField
                control={form.control}
                name="existingContact"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="py-2">Existing contacts</FormLabel>
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
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
                                key="contactSelection"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center justify-between w-full"
                              >
                                <span className="truncate">
                                  {field.value !== undefined
                                    ? existingContacts?.find(
                                        (contact) => contact._id === field.value
                                      )?.name
                                    : "Select an existing contact"}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </motion.div>
                            </AnimatePresence>
                          </Button>
                        </FormControl>
                      </PopoverTrigger>

                      <PopoverContent
                        className="w-[350px] md:w-[400px] p-0"
                        align="start"
                      >
                        <Command>
                          <CommandList>
                            <CommandInput placeholder="Search contact..." />
                            <CommandEmpty>No contact found.</CommandEmpty>
                            <CommandGroup>
                              {existingContacts
                                ?.filter((contact) =>
                                  contact.clients?.some(
                                    (client) => client._id === clientId
                                  )
                                )
                                .map((contact) => {
                                  const isAdded = projectContacts.some(
                                    (projectContact) =>
                                      projectContact._id === contact._id
                                  );
                                  return (
                                    <CommandItem
                                      disabled={isSubmitting || isAdded}
                                      value={contact.name || ""}
                                      key={contact._id}
                                      className="flex items-center justify-between"
                                      onSelect={() => {
                                        form.setValue(
                                          "existingContact",
                                          contact._id
                                        );
                                        setPopoverOpen(false);
                                      }}
                                    >
                                      <span className="truncate">
                                        {contact.name}
                                      </span>
                                      {isAdded && (
                                        <Badge variant="secondary">Added</Badge>
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          autoFocus
                          disabled={isSubmitting}
                          placeholder="John Doe"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isSubmitting}
                          placeholder="contact@email.com"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone number</FormLabel>
                      <FormControl>
                        <PhoneInput
                          defaultCountry="UG"
                          disabled={isSubmitting}
                          placeholder="Enter a phone number e.g. +256 792 445002"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isSubmitting}
                          placeholder="Technical Engineer"
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
                      Add contact to project
                      <ArrowRightCircle className="ml-5" />
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircleIcon className="h-5 w-5 mr-2 text-primary" />
          Add Contact
        </Button>
      </DialogTrigger>

      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Add Contact Person</DialogTitle>
          <DialogDescription>
            Associate a new / existing contact person with this project
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="contactType"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormControl>
                    <RadioGroup
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center justify-evenly space-x-4 my-5"
                    >
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem
                            value="new"
                            className="sr-only peer"
                            id="new-contact"
                          />
                        </FormControl>
                        <FormLabel
                          htmlFor="new-contact"
                          className="flex flex-col items-center justify-center w-40 h-25 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <PlusCircleIcon className="h-8 w-8 mb-2" />
                          <span className="text-sm text-center font-medium">
                            Create New
                          </span>
                        </FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem
                            value="existing"
                            className="sr-only peer"
                            id="existing-contact"
                          />
                        </FormControl>
                        <FormLabel
                          htmlFor="existing-contact"
                          className="flex flex-col items-center justify-center w-40 h-25 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <Users className="h-8 w-8 mb-2" />
                          <span className="text-sm font-medium">
                            Choose Existing
                          </span>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("contactType") === "existing" ? (
              <FormField
                control={form.control}
                name="existingContact"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="py-2">Existing contacts</FormLabel>
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
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
                                key="contactSelection"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center justify-between w-full"
                              >
                                <span className="truncate">
                                  {field.value !== undefined
                                    ? existingContacts?.find(
                                        (contact) => contact._id === field.value
                                      )?.name
                                    : "Select an existing contact"}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </motion.div>
                            </AnimatePresence>
                          </Button>
                        </FormControl>
                      </PopoverTrigger>

                      <PopoverContent
                        className="w-[350px] md:w-[400px] p-0"
                        align="start"
                      >
                        <Command>
                          <CommandList>
                            <CommandInput placeholder="Search contact..." />
                            <CommandEmpty>No contact found.</CommandEmpty>
                            <CommandGroup>
                              {existingContacts
                                ?.filter((contact) =>
                                  contact.clients?.some(
                                    (client) => client._id === clientId
                                  )
                                )
                                .map((contact) => {
                                  const isAdded = projectContacts.some(
                                    (projectContact) =>
                                      projectContact._id === contact._id
                                  );
                                  return (
                                    <CommandItem
                                      disabled={isSubmitting || isAdded}
                                      value={contact.name || ""}
                                      key={contact._id}
                                      className="flex items-center justify-between"
                                      onSelect={() => {
                                        form.setValue(
                                          "existingContact",
                                          contact._id
                                        );
                                        setPopoverOpen(false);
                                      }}
                                    >
                                      <span className="truncate">
                                        {contact.name}
                                      </span>
                                      {isAdded && (
                                        <Badge variant="secondary">Added</Badge>
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          autoFocus
                          disabled={isSubmitting}
                          placeholder="John Doe"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isSubmitting}
                          placeholder="contact@email.com"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone number</FormLabel>
                      <FormControl>
                        <PhoneInput
                          defaultCountry="UG"
                          disabled={isSubmitting}
                          placeholder="Enter a phone number e.g. +256 792 445002"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isSubmitting}
                          placeholder="Technical Engineer"
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
                      Add contact to project
                      <ArrowRightCircle className="ml-5" />
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
