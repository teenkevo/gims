"use client";

import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useForm } from "react-hook-form";
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
import { ArrowRightCircle } from "lucide-react";
import { isValidPhoneNumber } from "react-phone-number-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { ButtonLoading } from "@/components/button-loading";
import { createContactPerson } from "@/lib/actions";
import { PlusCircleIcon } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { CLIENT_BY_ID_QUERYResult } from "../../../../../sanity.types";
import { checkContactEmailExists } from "@/sanity/lib/clients/getContactByEmail";

export function CreateContactDialog({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [state, dispatch, isPending] = useActionState(
    createContactPerson,
    null
  );

  const form = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
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
      checkEmailExists(email);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [form.watch("email"), checkEmailExists]);

  const onSubmit = (
    data: Omit<
      CLIENT_BY_ID_QUERYResult[number]["contacts"][number],
      "_id" | "projects"
    >
  ) => {
    const formData = new FormData();
    formData.append("name", data.name || "");
    formData.append("email", data.email || "");
    formData.append("phone", data.phone || "");
    formData.append("designation", data.designation || "");
    formData.append("clientId", clientId);
    startTransition(() => dispatch(formData)); // Use dispatch instead of createProject
  };

  useEffect(() => {
    if (state?.status === "ok") {
      toast.success("Contact has been created");
      setOpen(false);
    } else if (state?.status === "error") {
      toast.error((state.error as string) || "Something went wrong");
    }
  }, [state]);

  const isMobile = useMediaQuery("(max-width: 640px)");

  const content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          rules={{ required: "Required" }}
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
          rules={{
            required: "Required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter valid email",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    disabled={isPending}
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
          rules={{
            required: "Required",
            validate: (value) =>
              isValidPhoneNumber(value || "") || "Enter valid phone number",
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number</FormLabel>
              <FormControl>
                <PhoneInput
                  defaultCountry="UG"
                  disabled={isPending}
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
          rules={{ required: "Required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Designation</FormLabel>
              <FormControl>
                <Input
                  disabled={isPending}
                  placeholder="Technical Engineer"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="py-2">
          <div className="flex items-center">
            <div className="relative after:pointer-events-none after:absolute after:inset-px after:rounded-[11px] after:shadow-highlight after:shadow-white/10 focus-within:after:shadow-[#77f6aa] after:transition w-full md:w-fit ">
              {isPending ? (
                <ButtonLoading />
              ) : (
                <Button
                  variant="default"
                  className="w-full"
                  disabled={!!emailError || isCheckingEmail}
                >
                  Add contact
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
            Add a new contact person to the client profile
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
          <DialogTitle>Create Contact Person</DialogTitle>
          <DialogDescription>
            Add a new contact person to the client profile
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
