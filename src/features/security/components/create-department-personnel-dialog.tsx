import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { isValidPhoneNumber } from "react-phone-number-input";
import { createPersonnel } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { FormSubmitButton } from "@/components/form-submit-button";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type FormData = {
  fullName: string;
  internalId: string;
  email: string;
  phone: string;
  role: string;
};

interface CreateDepartmentPersonnelDialogProps {
  open: boolean;
  onClose: () => void;
  departmentName: string;
  departmentId: string;
  roles: string[];
  defaultRole?: string;
}

export function CreateDepartmentPersonnelDialog({
  open,
  onClose,
  departmentName,
  departmentId,
  roles,
  defaultRole,
}: CreateDepartmentPersonnelDialogProps) {
  const [dialogLoading, setDialogLoading] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [state, dispatch, isPending] = useActionState(createPersonnel, null);

  const form = useForm<FormData>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      internalId: "",
      email: "",
      phone: "",
      role: "",
    },
  });

  const [fullName, email, phone, selectedRole] = form.watch([
    "fullName",
    "email",
    "phone",
    "role",
  ]);

  const canSubmit = useMemo(
    () =>
      fullName.trim().length > 0 &&
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim()) &&
      isValidPhoneNumber(phone || "") &&
      selectedRole.length > 0,
    [fullName, email, phone, selectedRole]
  );

  useEffect(() => {
    setDialogLoading(isPending);
  }, [isPending]);

  useEffect(() => {
    if (!open) {
      form.reset();
      return;
    }

    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    form.setValue("internalId", `EMP-${randomNumber}`);

    if (defaultRole && roles.includes(defaultRole)) {
      form.setValue("role", defaultRole, { shouldValidate: true });
    }
  }, [open, form, defaultRole, roles]);

  useEffect(() => {
    if (state?.status === "ok") {
      toast.success("Personnel has been created");
      onClose();
    } else if (state?.status === "error") {
      toast.error("Something went wrong");
    }
  }, [state, onClose]);

  const onSubmit = (data: FormData) => {
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("internalId", data.internalId);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append(
      "departmentRoles",
      JSON.stringify([
        {
          department: departmentName,
          departmentId,
          role: data.role,
        },
      ])
    );
    formData.append("isEdit", "false");
    startTransition(() => dispatch(formData));
  };

  return (
    <Dialog loading={dialogLoading} open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Add personnel to the {departmentName} Department
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 max-h-[400px] overflow-y-auto px-1 py-4 pb-24"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="internalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Internal ID</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullName"
                rules={{ required: "Full name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        autoFocus
                        placeholder="Enter full name"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@company.com"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                rules={{
                  required: "Required",
                  validate: (value) =>
                    isValidPhoneNumber(value || "") ||
                    "Enter valid phone number",
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Phone Number</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="role"
              rules={{ required: "A role is required" }}
              render={() => (
                <FormItem>
                  <FormLabel required>Select a role for the new user</FormLabel>

                  <Popover modal open={roleOpen} onOpenChange={setRoleOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={isPending}
                          variant="outline"
                          role="combobox"
                          aria-expanded={roleOpen}
                          className="w-full justify-between"
                        >
                          {selectedRole || "Select role"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search roles..." />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup>
                            {roles.map((roleName) => (
                              <CommandItem
                                key={roleName}
                                value={roleName}
                                onSelect={() => {
                                  form.setValue("role", roleName, {
                                    shouldValidate: true,
                                  });
                                  setRoleOpen(false);
                                }}
                                className={cn(
                                  selectedRole === roleName && "bg-muted"
                                )}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedRole === roleName
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {roleName}
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

            <FormSubmitButton
              text="Save"
              isSubmitting={isPending}
              disabled={!canSubmit}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
