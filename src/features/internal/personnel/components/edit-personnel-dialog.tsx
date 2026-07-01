"use client";

import { startTransition, useActionState, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { isValidPhoneNumber } from "react-phone-number-input";
import type { ALL_PERSONNEL_QUERY_RESULT } from "../../../../../sanity.types";
import { updatePersonnel } from "@/lib/actions";
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
  CommandSeparator,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";

type DepartmentRole = {
  department: string;
  departmentId: string;
  role: string;
};

type FormData = {
  fullName: string;
  internalId: string;
  email: string;
  phone: string;
  departmentRoles: DepartmentRole[];
};

interface EditPersonnelDialogProps {
  open: boolean;
  onClose: () => void;
  personnel: ALL_PERSONNEL_QUERY_RESULT[number];
  departmentRoles: Record<
    string,
    { roles: (string | undefined)[]; departmentId: string }
  >;
}

export function EditPersonnelDialog({
  open,
  onClose,
  personnel,
  departmentRoles,
}: EditPersonnelDialogProps) {
  const [dialogLoading, setDialogLoading] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [state, dispatch, isPending] = useActionState(updatePersonnel, null);

  const existingDepartmentRoles = useMemo(
    () =>
      personnel.departmentRoles?.map((role) => ({
        department: role.department?.department || "",
        role: role.role || "",
        departmentId: role.department?._id || "",
      })) ?? [],
    [personnel]
  );

  const form = useForm<FormData>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: personnel.fullName || "",
      internalId: personnel.internalId || "",
      email: personnel.email || "",
      phone: personnel.phone || "",
      departmentRoles: existingDepartmentRoles,
    },
  });

  const selectedDepartmentRoles = form.watch("departmentRoles");

  useEffect(() => {
    setDialogLoading(isPending);
  }, [isPending]);

  useEffect(() => {
    if (!open) return;

    form.reset({
      fullName: personnel.fullName || "",
      internalId: personnel.internalId || "",
      email: personnel.email || "",
      phone: personnel.phone || "",
      departmentRoles: existingDepartmentRoles,
    });
  }, [open, personnel, form, existingDepartmentRoles]);

  useEffect(() => {
    if (state?.status === "ok") {
      toast.success("Personnel has been updated");
      onClose();
    } else if (state?.status === "error") {
      toast.error("Something went wrong");
    }
  }, [state, onClose]);

  const toggleDepartmentRole = (
    department: string,
    departmentId: string,
    role: string
  ) => {
    const existingIndex = selectedDepartmentRoles.findIndex(
      (item) => item.department === department
    );
    const updatedDepartmentRoles = [...selectedDepartmentRoles];

    if (existingIndex >= 0) {
      updatedDepartmentRoles[existingIndex] = {
        department,
        departmentId,
        role,
      };
    } else {
      updatedDepartmentRoles.push({ department, departmentId, role });
    }

    form.setValue("departmentRoles", updatedDepartmentRoles);
  };

  const onSubmit = (data: FormData) => {
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("internalId", data.internalId);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("departmentRoles", JSON.stringify(data.departmentRoles));
    formData.append("isEdit", "true");
    formData.append("personnelId", personnel._id);
    startTransition(() => dispatch(formData));
  };

  return (
    <Dialog loading={dialogLoading} open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Personnel</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 max-h-[460px] overflow-y-auto px-1 py-4"
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
              name="departmentRoles"
              rules={{
                required: "At least one department and role is required",
              }}
              render={() => (
                <FormItem>
                  <FormLabel>Departments & Roles</FormLabel>
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
                          {selectedDepartmentRoles.length > 0
                            ? `${selectedDepartmentRoles.length} department${selectedDepartmentRoles.length > 1 ? "s" : ""} selected`
                            : "Select departments and roles"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search departments or roles..." />
                        <CommandList>
                          <ScrollArea className="h-72 overflow-y-auto">
                            <CommandEmpty>No results found.</CommandEmpty>
                            {Object.entries(departmentRoles).map(
                              ([department, { roles, departmentId }]) => (
                                <div key={department}>
                                  <CommandGroup heading={department}>
                                    {roles.map((role) => {
                                      const isSelected =
                                        selectedDepartmentRoles.some(
                                          (item) =>
                                            item.department === department &&
                                            item.role === role
                                        );
                                      const departmentHasRole =
                                        selectedDepartmentRoles.some(
                                          (item) =>
                                            item.department === department
                                        );
                                      const isDisabled =
                                        departmentHasRole && !isSelected;

                                      return (
                                        <CommandItem
                                          key={`${department}-${role}`}
                                          value={`${department}-${role}`}
                                          disabled={isDisabled}
                                          onSelect={() => {
                                            toggleDepartmentRole(
                                              department,
                                              departmentId,
                                              role || ""
                                            );
                                            setRoleOpen(false);
                                          }}
                                          className={cn(
                                            isDisabled &&
                                              "opacity-50 cursor-not-allowed",
                                            isSelected && "bg-muted"
                                          )}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              isSelected
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {role}
                                          {isDisabled && (
                                            <span className="ml-auto text-xs text-gray-500">
                                              (Already assigned)
                                            </span>
                                          )}
                                        </CommandItem>
                                      );
                                    })}
                                  </CommandGroup>
                                  <CommandSeparator />
                                </div>
                              )
                            )}
                          </ScrollArea>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select departments and roles. One role per department.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormSubmitButton text="Save" isSubmitting={isPending} />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
