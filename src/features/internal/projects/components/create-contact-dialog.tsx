"use client";

import { useState, useCallback, useEffect } from "react";
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
  DrawerTrigger,
} from "@/components/ui/drawer";
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
import { checkContactEmailExists } from "@/sanity/lib/clients/getContactByEmail";

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
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const { mutation } = useCreateContact();

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactType: "new",
      existingContact: undefined,
      name: "",
      email: "",
      phone: undefined,
      designation: "",
    },
  });

  // Debounced email validation
  const checkEmailExists = useCallback(
    async (email: string) => {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailError(null);
        return;
      }

      setIsCheckingEmail(true);
      try {
        const existingContact = await checkContactEmailExists(email, clientId);

        if (existingContact) {
          setEmailError(
            `A contact with this email already exists for this client`
          );
        } else {
          setEmailError(null);
        }
      } catch (error) {
        console.error("Error checking email:", error);
        setEmailError(null);
      } finally {
        setIsCheckingEmail(false);
      }
    },
    [clientId]
  );

  // Debounce the email check
  useEffect(() => {
    const email = form.watch("email");
    const timeoutId = setTimeout(() => {
      if (email) {
        checkEmailExists(email);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [form.watch("email"), checkEmailExists]);

  // Reset email validation state when contact type changes
  useEffect(() => {
    const contactType = form.watch("contactType");
    if (contactType === "existing") {
      setEmailError(null);
      setIsCheckingEmail(false);
    } else if (contactType === "new") {
      // Re-validate email if there's already a value when switching back to "new"
      const email = form.getValues("email");
      if (email) {
        checkEmailExists(email);
      }
    }
  }, [form.watch("contactType"), checkEmailExists]);

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

  // 1. Filter contacts that belong to the current client
  const contactsForCurrentClient =
    existingContacts?.filter((contact) => contact.client?._id === clientId) ??
    [];

  // 2. Get IDs of contacts already added to the project
  const addedContactIds = new Set(projectContacts.map((c) => c._id));

  // 3. Prepare the list of selectable contacts with their "isAdded" status
  const selectableContacts = contactsForCurrentClient.map((contact) => ({
    ...contact,
    isAdded: addedContactIds.has(contact._id),
  }));

  const content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="contactType"
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
                      <RadioGroupItem
                        value="new"
                        className="sr-only peer"
                        id="new-contact"
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="new-contact"
                      className="flex flex-col items-center justify-center flex-1 h-25 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <PlusCircleIcon className="h-8 w-8 mb-2" />
                      <span className="text-sm text-center font-medium">
                        Create New
                      </span>
                    </FormLabel>
                  </FormItem>
                  <FormItem className="w-1/2">
                    <FormControl>
                      <RadioGroupItem
                        value="existing"
                        className="sr-only peer"
                        id="existing-contact"
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="existing-contact"
                      className="flex flex-col items-center justify-center flex-1 h-25 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
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
                          "w-full justify-between",
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

                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandList>
                        <CommandInput placeholder="Search contact..." />
                        <CommandEmpty>No contact found.</CommandEmpty>
                        <CommandGroup>
                          {selectableContacts.map((contact) => (
                            <CommandItem
                              disabled={isSubmitting || contact.isAdded}
                              value={contact.name || ""}
                              key={contact._id}
                              className="flex items-center justify-between"
                              onSelect={() => {
                                form.setValue("existingContact", contact._id);
                                setPopoverOpen(false);
                              }}
                            >
                              <span className="truncate">{contact.name}</span>
                              {contact.isAdded && (
                                <Badge variant="secondary">Added</Badge>
                              )}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
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
                    <div className="relative">
                      <Input
                        disabled={isSubmitting}
                        placeholder="contact@email.com"
                        {...field}
                      />
                      {isCheckingEmail && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                  {emailError && (
                    <p className="text-[13px] text-destructive">{emailError}</p>
                  )}
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

        <div className="py-2">
          <div className="flex items-center">
            <div className="relative after:pointer-events-none after:absolute after:inset-px after:rounded-[11px] after:shadow-highlight after:shadow-white/10 focus-within:after:shadow-[#77f6aa] after:transition w-full">
              {isSubmitting ? (
                <ButtonLoading />
              ) : (
                <Button
                  type="submit"
                  variant="default"
                  className="w-full"
                  disabled={!!emailError || isCheckingEmail}
                >
                  Add contact to project
                  <ArrowRightCircle className="ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );

  return isMobile ? (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
          form.reset();
          setEmailError(null);
        }
      }}
    >
      <DrawerTrigger asChild>
        <Button variant="outline">
          <PlusCircleIcon className="h-5 w-5 mr-2 text-primary" />
          Add Contact
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add Contact Person</DrawerTitle>
          <DrawerDescription>
            Associate a new / existing contact person with this project
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 pb-0">{content}</div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
          form.reset();
          setEmailError(null);
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
        {content}
      </DialogContent>
    </Dialog>
  );
}
