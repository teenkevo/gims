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
import { ArrowRightCircle, PencilIcon, PlusCircleIcon } from "lucide-react";
import { isValidPhoneNumber } from "react-phone-number-input";
import { PhoneInput } from "@/components/ui/phone-input";

import { ButtonLoading } from "@/components/button-loading";
import { useUpdateContact } from "@/features/customer/clients/api/use-update-contact";
import { ALL_CONTACTS_QUERYResult } from "../../../../../sanity.types";
const formSchema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email({ message: "Enter valid email" }).min(1, "Required"),
  phone: z.string().refine(isValidPhoneNumber, {
    message: "Please enter a valid phone number",
  }),
  designation: z.string().min(1, "Required"),
});

export function UpdateContactDialog({
  contact,
}: {
  contact: ALL_CONTACTS_QUERYResult[number];
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutation } = useUpdateContact();

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: contact.name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      designation: contact.designation || "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formattedData = {
      contactId: contact._id,
      name: values.name,
      email: values.email,
      phone: values.phone,
      designation: values.designation,
    };

    mutation.mutate(
      { json: formattedData },
      {
        onSuccess: () => {
          toast.success("Contact has been updated");
          setIsSubmitting(false);
          setOpen(false);
          form.reset();
        },
        onError: () => {
          toast.error("Something went wrong");
          setIsSubmitting(false);
          setOpen(false);
          form.reset();
        },
      }
    );
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
        <Button size="icon" variant="outline">
          <PencilIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent aria-describedby={undefined} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Contact Person</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <DialogFooter className="py-2">
              <div className="flex items-center">
                <div className="relative after:pointer-events-none after:absolute after:inset-px after:rounded-[11px] after:shadow-highlight after:shadow-white/10 focus-within:after:shadow-[#77f6aa] after:transition">
                  {isSubmitting ? (
                    <ButtonLoading />
                  ) : (
                    <Button type="submit" variant="default">
                      Update contact
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
