import { SingleFieldForm } from "@/components/single-field-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import React, { useState } from "react";
import { z } from "zod";
import { useUpdateProjectName } from "../api/use-update-project-name";

interface ProjectUpdateNameFormProps {
  title: string;
  description?: string;
  learnMoreLink?: string;
  learnMoreText?: string;
  savable: boolean;
  fieldName: string;
  initialValue: string;
  projectId: string;
}

export default function ProjectUpdateNameForm({
  title,
  description,
  learnMoreLink,
  learnMoreText,
  savable,
  fieldName,
  initialValue,
  projectId,
}: ProjectUpdateNameFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutation } = useUpdateProjectName();

  const handleUpdateProjectName = async (name: any): Promise<void> => {
    setIsSubmitting(true);
    try {
      mutation.mutate({
        json: {
          projectId,
          projectName: name,
        },
      });

      toast("✅ Successful operation", {
        description: "Updated project name successfully",
      });
    } catch (error) {
      toast("⚠️ Uh Oh! Something went wrong", {
        description: "Project name was not updated",
      });

      throw new Error("Error in mutation response");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SingleFieldForm
      title={title}
      description={description}
      learnMoreLink={learnMoreLink}
      learnMoreText={learnMoreText}
      savable={savable}
      fieldName={fieldName}
      initialValue={initialValue}
      onSubmit={handleUpdateProjectName}
      isSubmitting={isSubmitting}
      validation={z.string().trim().min(1, "Required")}
      renderField={(form) => (
        <FormField
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input disabled={isSubmitting} {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    ></SingleFieldForm>
  );
}
