import { SingleFieldForm } from "@/components/single-field-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { PhoneInput } from "@/components/ui/phone-input";
import { updateClientPhone } from "@/sanity/lib/clients/updateClientPhone";
import React, { useState } from "react";
import { isValidPhoneNumber } from "react-phone-number-input";
import { toast } from "sonner";
import { z } from "zod";

interface ProjectUpdateClientPhoneFormProps {
  title: string;
  description?: string;
  learnMoreLink?: string;
  learnMoreText?: string;
  savable: boolean;
  fieldName: string;
  initialValue: string;
  clientId: string;
}

export default function ProjectUpdateClientPhoneForm({
  title,
  description,
  learnMoreLink,
  learnMoreText,
  savable,
  fieldName,
  initialValue,
  clientId,
}: ProjectUpdateClientPhoneFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateClientPhone = async (phone: string) => {
    setIsSubmitting(true);
    try {
      await updateClientPhone(clientId, phone);

      toast("✅ Successful operation", {
        description: "Updated client phone successfully",
      });
    } catch (error) {
      toast("⚠️ Uh Oh! Something went wrong", {
        description: "Client phone was not updated",
      });

      throw new Error("Error in mutation response"); // this error is caught in the handleForm submit of Single Field Form
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
      onSubmit={handleUpdateClientPhone}
      isSubmitting={isSubmitting}
      validation={z.string().refine(isValidPhoneNumber, {
        message: "Please enter a valid phone number",
      })}
      renderField={(form) => (
        <FormField
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PhoneInput
                  disabled={isSubmitting}
                  placeholder="Enter a phone number e.g. +256 792 445002"
                  {...field}
                  autoComplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    ></SingleFieldForm>
  );
}
