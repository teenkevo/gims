import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DrawerClose } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import {
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Drawer } from "@/components/ui/drawer";
import { FormSubmitButton } from "@/components/form-submit-button";
import { PhoneInput } from "@/components/ui/phone-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createPersonnel, updatePersonnel } from "@/lib/actions";
import { toast } from "sonner";
import { isValidPhoneNumber } from "react-phone-number-input";
import { ALL_PERSONNEL_QUERY_RESULT } from "../../../../../sanity.types";

// Define a type for department-role pairs
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

export function CreatePersonnelDialog({
  departmentRoles,
  isEdit = false,
  personnel,
  open,
  onClose,
  rolePickerLabel,
  rolesOnly = false,
}: {
  departmentRoles: Record<
    string,
    { roles: (string | undefined)[]; departmentId: string }
  >;
  isEdit?: boolean;
  personnel?: ALL_PERSONNEL_QUERY_RESULT[number];
  open?: boolean;
  onClose?: () => void;
  rolePickerLabel?: string;
  rolesOnly?: boolean;
}) {
  const [dialogLoading, setDialogLoading] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog loading={dialogLoading} open={open} onOpenChange={onClose}>
        <DialogContent
          aria-describedby={undefined}
          className="sm:max-w-[600px]"
        >
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Personnel" : "Add New Personnel"}
            </DialogTitle>
          </DialogHeader>

          <CreatePersonnelForm
            onPendingChange={setDialogLoading}
            departmentRoles={departmentRoles}
            onClose={onClose}
            isEdit={isEdit}
            personnel={personnel}
            rolePickerLabel={rolePickerLabel}
            rolesOnly={rolesOnly}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer loading={dialogLoading} open={open} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>
            {isEdit ? "Edit Personnel" : "Add New Personnel"}
          </DrawerTitle>
        </DrawerHeader>
        <CreatePersonnelForm
          onPendingChange={setDialogLoading}
          departmentRoles={departmentRoles}
          onClose={onClose}
          isEdit={isEdit}
          personnel={personnel}
          rolePickerLabel={rolePickerLabel}
          rolesOnly={rolesOnly}
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

function CreatePersonnelForm({
  departmentRoles,
  onClose,
  isEdit = false,
  personnel,
  onPendingChange,
  rolePickerLabel,
  rolesOnly = false,
}: {
  departmentRoles: Record<
    string,
    { roles: (string | undefined)[]; departmentId: string }
  >;
  onClose?: () => void;
  isEdit?: boolean;
  personnel?: ALL_PERSONNEL_QUERY_RESULT[number];
  onPendingChange?: (pending: boolean) => void;
  rolePickerLabel?: string;
  rolesOnly?: boolean;
}) {
  const [roleOpen, setRoleOpen] = useState(false);

  // Restored useActionState
  const [state, dispatch, isPending] = useActionState(
    isEdit ? updatePersonnel : createPersonnel,
    null
  );
  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  const existingDepartmentRoles = personnel?.departmentRoles?.map((role) => ({
    department: role.department?.department || "",
    role: role.role || "",
    departmentId: role.department?._id || "",
  }));

  const form = useForm<FormData>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: personnel?.fullName || "",
      internalId: personnel?.internalId || "",
      email: personnel?.email || "",
      phone: personnel?.phone || "",
      departmentRoles: existingDepartmentRoles || [],
    },
  });

  const selectedDepartmentRoles = form.watch("departmentRoles");
  const singleDepartmentEntry = rolesOnly
    ? Object.entries(departmentRoles)[0]
    : undefined;
  const pickerLabel = rolePickerLabel ?? "Departments & Roles";

  // Generate employee ID on component mount
  useEffect(() => {
    const generateInternalId = () => {
      const randomNumber = Math.floor(10000 + Math.random() * 90000);
      return `EMP-${randomNumber}`;
    };
    if (!isEdit) {
      form.setValue("internalId", generateInternalId());
    } else {
      form.setValue("internalId", personnel?.internalId || "");
    }
  }, [form, isEdit, personnel]);

  // Update departments list when department-roles change
  useEffect(() => {
    const departments = selectedDepartmentRoles.map((item) => item.department);
    // Use Set to remove duplicates
    const uniqueDepartments = [...new Set(departments)];
    // form.setValue("departments", uniqueDepartments);
  }, [selectedDepartmentRoles, form]);

  const onSubmit = (data: FormData) => {
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("internalId", data.internalId);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("departmentRoles", JSON.stringify(data.departmentRoles));
    formData.append("isEdit", isEdit.toString());
    if (isEdit) {
      formData.append("personnelId", personnel?._id || "");
    }
    startTransition(() => dispatch(formData));
  };

  useEffect(() => {
    if (state?.status === "ok") {
      toast.success(`Personnel has been ${isEdit ? "updated" : "created"}`);
      onClose?.();
    } else if (state?.status === "error") {
      toast.error("Something went wrong");
    }
  }, [state, onClose, isEdit]);

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
      // Replace the role for this department
      updatedDepartmentRoles[existingIndex] = {
        department,
        departmentId,
        role,
      };
    } else {
      // Add new department-role pair
      updatedDepartmentRoles.push({ department, departmentId, role });
    }

    form.setValue("departmentRoles", updatedDepartmentRoles);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 h-[400px] px-4 md:px-1 py-4 overflow-y-auto"
      >
        {/* Personal Information */}
        <div className="space-y-4">
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
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
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
                  isValidPhoneNumber(value || "") || "Enter valid phone number",
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
        </div>

        {/* Position Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="departmentRoles"
              rules={{
                required: rolesOnly
                  ? "A role is required"
                  : "At least one department and role is required",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{pickerLabel}</FormLabel>
                  <Popover
                    modal={true}
                    open={roleOpen}
                    onOpenChange={setRoleOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={isPending}
                          variant="outline"
                          role="combobox"
                          aria-expanded={roleOpen}
                          className="w-full justify-between"
                        >
                          {rolesOnly
                            ? selectedDepartmentRoles[0]?.role || "Select role"
                            : selectedDepartmentRoles.length > 0
                              ? `${selectedDepartmentRoles.length} department${selectedDepartmentRoles.length > 1 ? "s" : ""} selected`
                              : "Select departments and roles"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder={
                            rolesOnly
                              ? "Search roles..."
                              : "Search departments or roles..."
                          }
                        />
                        <CommandList>
                          <ScrollArea className="overflow-y-auto">
                            <CommandEmpty>No results found.</CommandEmpty>
                            {rolesOnly && singleDepartmentEntry ? (
                              <CommandGroup>
                                {singleDepartmentEntry[1].roles
                                  .filter((role): role is string =>
                                    Boolean(role)
                                  )
                                  .map((role) => {
                                    const [department, { departmentId }] =
                                      singleDepartmentEntry;
                                    const isSelected =
                                      selectedDepartmentRoles.some(
                                        (item) =>
                                          item.department === department &&
                                          item.role === role
                                      );

                                    return (
                                      <CommandItem
                                        key={role}
                                        value={role}
                                        onSelect={() => {
                                          toggleDepartmentRole(
                                            department,
                                            departmentId,
                                            role
                                          );
                                          setRoleOpen(false);
                                        }}
                                        className={cn(isSelected && "bg-muted")}
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
                                      </CommandItem>
                                    );
                                  })}
                              </CommandGroup>
                            ) : (
                              Object.entries(departmentRoles).map(
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
                              )
                            )}
                          </ScrollArea>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    {rolesOnly
                      ? "Select a role for this department."
                      : "Select departments and roles. One role per department."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <FormSubmitButton text="Save" isSubmitting={isPending} />
      </form>
    </Form>
  );
}
