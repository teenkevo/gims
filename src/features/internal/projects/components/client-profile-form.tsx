"use client";

// Core
import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Icons
import { Check, ChevronsUpDown, Plus, Trash } from "lucide-react";

// Components
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Formheader from "@/components/form-header";
import FormSpacerWrapper from "@/components/form-spacer-wrapper";
import { ALL_CLIENTS_QUERYResult } from "../../../../../sanity.types";

interface ClientProfileFormProps {
  isSubmitting: boolean;
  clients: ALL_CLIENTS_QUERYResult;
}

export function ClientProfileForm({
  isSubmitting,
  clients,
}: ClientProfileFormProps) {
  const [open, setOpen] = useState(false);
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "clients",
    rules: {
      required: {
        value: true,
        message: "At least one client profile is required",
      },
    },
  });

  const clientsArrayError = errors.clients?.root?.message as string;

  return (
    <FormSpacerWrapper>
      <Formheader title="Create / Add Client Profile" step={2} />
      {fields.map((clientField, index) => {
        const clientType = watch(`clients.${index}.clientType`);
        return (
          <FormItem key={clientField.id} className="mb-4 border p-4 rounded-lg">
            {/* Client Type Selection */}
            <FormField
              control={control}
              name={`clients.${index}.clientType`}
              render={({ field }) => (
                <FormItem>
                  <RadioGroup
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-row space-x-4"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="new" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Create New Client
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="existing" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Existing Client
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Existing Client Selection */}
            {clientType === "existing" && (
              <FormField
                control={control}
                name={`clients.${index}.existingClient`}
                rules={{ required: "Please select an existing client" }}
                render={({ field }) => (
                  <FormItem className="py-4">
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            disabled={isSubmitting}
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-auto justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <AnimatePresence mode="wait">
                              <motion.div
                                key="clientSelection"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center justify-between w-full"
                              >
                                {field.value
                                  ? clients.find((c) => c._id === field.value)
                                      ?.name
                                  : "Select an existing client"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </motion.div>
                            </AnimatePresence>
                          </Button>
                        </FormControl>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto p-0" align="start">
                        <Command>
                          <CommandList>
                            <CommandInput placeholder="Search client..." />
                            <CommandEmpty>No client found.</CommandEmpty>
                            <CommandGroup>
                              {clients.map((client) => (
                                <CommandItem
                                  disabled={isSubmitting}
                                  value={client.name || ""}
                                  key={client._id}
                                  onSelect={() => {
                                    setValue(
                                      `clients.${index}.existingClient`,
                                      client._id
                                    );
                                    setOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      client._id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {client.name}
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
            )}

            {/* New Client Fields */}
            {clientType === "new" && (
              <div className="flex flex-col py-4 space-y-4">
                <FormField
                  control={control}
                  name={`clients.${index}.newClientName`}
                  rules={{ required: "Client name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isSubmitting}
                          placeholder="e.g. Acme Corporation"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Remove Client Button */}
            <Button
              type="button"
              variant="destructive"
              onClick={() => remove(index)}
              className="mt-3"
            >
              <Trash className="w-4 h-4 mr-2" /> Remove Client
            </Button>
          </FormItem>
        );
      })}

      {/* Add More Clients Button */}

      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              clientType: "new",
              existingClient: undefined,
              newClientName: "",
            })
          }
        >
          <Plus className="w-4 h-4 mr-2" /> Add a Client
        </Button>
        {errors.clients && (
          <p className="text-sm font-medium text-destructive">
            {clientsArrayError}
          </p>
        )}
      </div>
    </FormSpacerWrapper>
  );
}
