"use client";

import { useActionState, useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

// Components
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowRightCircle, PencilIcon } from "lucide-react";
import { isValidPhoneNumber } from "react-phone-number-input";
import { PhoneInput } from "@/components/ui/phone-input";

import { ButtonLoading } from "@/components/button-loading";
import type { ALL_CONTACTS_QUERYResult } from "../../../../../sanity.types";
import { updateContactPerson } from "@/lib/actions";
import { useMediaQuery } from "@/hooks/use-media-query";

const formSchema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email({ message: "Enter valid email" }).min(1, "Required"),
  phone: z.string().refine(isValidPhoneNumber, {
    message: "Please enter a valid phone number",
  }),
  designation: z.string().min(1, "Required"),
});

export function UpdateContactDialog({ contact }: { contact: ALL_CONTACTS_QUERYResult[number] }) {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");

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

  const action = async (_: void | null, formData: FormData) => {
    console.log("clicked");
    const result = await updateContactPerson(contact._id, formData);
    if (result.status === "ok") {
      form.reset();
      setOpen(false);
      toast.success("Contact has been updated");
    } else {
      toast.error("Something went wrong");
    }
  };

  const [_, dispatch, isPending] = useActionState(action, null);

  const formContent = (
    <Form {...form}>
      <form action={dispatch} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input disabled={isPending} placeholder="John Doe" {...field} />
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
                <Input disabled={isPending} placeholder="contact@email.com" {...field} />
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
                <PhoneInput disabled={isPending} placeholder="Enter a phone number e.g. +256 792 445002" {...field} />
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
                <Input disabled={isPending} placeholder="Technical Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="py-2">
          <div className="flex items-center">
            <div className="relative after:pointer-events-none after:absolute after:inset-px after:rounded-[11px] after:shadow-highlight after:shadow-white/10 focus-within:after:shadow-[#77f6aa] after:transition w-full">
              {isPending ? (
                <ButtonLoading />
              ) : (
                <Button type="submit" variant="default" className="w-full">
                  Save
                  <ArrowRightCircle className="ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );

  if (isMobile) {
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
        <DrawerTrigger asChild>
          <Button size="icon" variant="outline">
            <PencilIcon className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="gap-3 text-left">
            <DrawerTitle>Update Contact Person</DrawerTitle>
          </DrawerHeader>
          <div className="px-4">{formContent}</div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

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
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <PencilIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent aria-describedby={undefined}>
        <DialogHeader className="gap-3 text-left">
          <DialogTitle>Update Contact Person</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
