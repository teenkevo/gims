"use client";

import { startTransition, useActionState, useEffect } from "react";
import { FormProvider, useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateLabIdentity } from "@/lib/actions";
import { LAB_SECTIONS, LAB_STATUSES } from "../constants";
import { LabSectionForm } from "./lab-section-form";

type LabIdentityValues = {
  description: string;
  labSection: string;
  status: string;
  location: string;
  capacity: string;
};

export function LabUpdateIdentityForm({
  labId,
  initialValues,
}: {
  labId: string;
  initialValues: LabIdentityValues;
}) {
  const action = async (_: unknown, formData: FormData) => {
    const result = await updateLabIdentity(formData, labId);
    if (result.status === "ok") {
      toast.success("Laboratory details have been updated");
    } else {
      toast.error("Something went wrong");
    }
    return result;
  };

  const [actionResult, dispatch, isPending] = useActionState(action, null);

  const form = useForm<LabIdentityValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: initialValues,
  });

  const { isDirty, errors } = useFormState({ control: form.control });

  useEffect(() => {
    if (actionResult?.status === "ok") {
      form.reset(form.getValues());
    }
  }, [actionResult, form]);

  const onSubmit = (data: LabIdentityValues) => {
    const formData = new FormData();
    formData.append("description", data.description);
    formData.append("labSection", data.labSection);
    formData.append("status", data.status);
    formData.append("location", data.location);
    formData.append("capacity", data.capacity);
    startTransition(() => dispatch(formData));
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <LabSectionForm
          title="Laboratory Identity"
          description="Section, status, location, and capacity"
          isSubmitting={isPending}
          isDirty={isDirty}
          hasError={Object.keys(errors).length > 0}
        >
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Scope of testing, specialisations, and responsibilities"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="labSection"
              rules={{ required: "Lab section is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Lab Section</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LAB_SECTIONS.map((section) => (
                        <SelectItem key={section.value} value={section.value}>
                          {section.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LAB_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workstation Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="e.g. 8"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Building, floor, or site location"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormDescription>
                  Physical location of this laboratory
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </LabSectionForm>
      </form>
    </FormProvider>
  );
}
