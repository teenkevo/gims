"use client";

// Core
import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Icons
import {
  BriefcaseBusiness,
  Check,
  ChevronsUpDown,
  Plus,
  PlusCircle,
  Trash,
  UserPlus,
  Users,
} from "lucide-react";

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
import Formheader from "@/components/form-header";
import FormSpacerWrapper from "@/components/form-spacer-wrapper";
import type { ALL_CLIENTS_QUERYResult } from "../../../../../sanity.types";
import { CardSelector } from "../../../internal/projects/components/card-selector";

interface ClientProfileFormProps {
  isSubmitting: boolean;
  clients: ALL_CLIENTS_QUERYResult;
}

export function ClientProfileForm({
  isSubmitting,
  clients,
}: ClientProfileFormProps) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
  } = useFormContext();

  // Initialize with one default client
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

  // Manage open state for each client
  const [openStates, setOpenStates] = useState<boolean[]>(
    Array(fields.length).fill(false)
  );

  const togglePopover = (index: number) => {
    setOpenStates((prev) => {
      const newStates = [...prev];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };

  const prefix = `C-`;

  return (
    <FormSpacerWrapper>
      <Formheader title="Create / Add Client Profile" step={2} />
      {fields.map((clientField, index) => {
        const clientType = watch(`clients.${index}.clientType`);
        return (
          <motion.div
            key={clientField.id}
            layout="position"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-b"
          >
            <FormItem
              key={clientField.id}
              className="mb-10 border px-4 rounded-lg border-dashed"
            >
              {/* Client Type Selection */}
              <FormField
                control={control}
                name={`clients.${index}.clientType`}
                render={({ field }) => (
                  <FormItem>
                    <CardSelector
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        if (val === "new") {
                          const currentId = watch(
                            `clients.${index}.newClientInternalId`
                          );
                          if (!currentId) {
                            const generated = `C-${Math.floor(10000 + Math.random() * 90000).toString()}`;
                            setValue(
                              `clients.${index}.newClientInternalId`,
                              generated
                            );
                          }
                        }
                      }}
                      disabled={isSubmitting}
                      options={[
                        {
                          value: "new",
                          label: "Create New Client",
                          icon: <UserPlus className="h-8 w-8" />,
                        },
                        {
                          value: "existing",
                          label: "Choose Existing",
                          icon: <BriefcaseBusiness className="h-8 w-8" />,
                        },
                      ]}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Existing Client Selection */}
              {clientType === "existing" && (
                <div className="flex flex-col py-4 space-y-4">
                  <FormField
                    control={control}
                    name={`clients.${index}.existingClient`}
                    rules={{ required: "Please select an existing client" }}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="py-1">
                          Existing contacts
                        </FormLabel>
                        <Popover
                          open={openStates[index]}
                          onOpenChange={() => togglePopover(index)}
                        >
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
                                      ? clients.find(
                                          (c) => c._id === field.value
                                        )?.name
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
                                        togglePopover(index);
                                        clearErrors(
                                          `clients.${index}.existingClient`
                                        );
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
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      disabled={isSubmitting}
                      variant="destructive"
                      onClick={() => remove(index)}
                      className="mt-3 max-w-[150px]"
                    >
                      <Trash className="w-4 h-4 mr-2" /> Remove Client
                    </Button>
                  )}
                </div>
              )}

              {/* New Client Fields */}
              {clientType === "new" && (
                <div className="flex flex-col py-4 space-y-4">
                  <FormField
                    control={control}
                    name={`clients.${index}.newClientInternalId`}
                    rules={{ required: "Client internal ID is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Client Internal ID</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute text-sm left-3 top-1/2 -translate-y-1/2 font-bold select-none">
                              {prefix}
                            </div>
                            <Input
                              disabled
                              {...field}
                              value={(field.value || prefix).replace(
                                prefix,
                                ""
                              )}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                setValue(
                                  `clients.${index}.newClientInternalId`,
                                  `${prefix}${newValue}`
                                );
                              }}
                              className={cn(
                                "pl-[calc(0.5rem_+_var(--prefix-length))]"
                              )}
                              style={
                                {
                                  "--prefix-length": `${prefix.length}ch`,
                                } as React.CSSProperties
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`clients.${index}.newClientName`}
                    rules={{ required: "Client name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Client Name</FormLabel>
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
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      disabled={isSubmitting}
                      variant="destructive"
                      onClick={() => remove(index)}
                      className="mt-3 max-w-[150px]"
                    >
                      <Trash className="w-4 h-4 mr-2" /> Remove Client
                    </Button>
                  )}
                </div>
              )}
            </FormItem>
          </motion.div>
        );
      })}

      {/* Add More Clients Button */}
      <div className="space-y-4">
        <div className="flex-row">
          {fields.length === 0 && (
            <p
              className={cn(
                'after:ml-0.5 after:text-destructive after:content-["*"]',
                "my-2 text-sm font-medium"
              )}
            >
              Atleast one client is required
            </p>
          )}
          <Button
            type="button"
            disabled={isSubmitting}
            variant="outline"
            onClick={() =>
              append({
                clientType: "new",
                existingClient: "",
                newClientName: "",
                newClientInternalId: `C-${Math.floor(10000 + Math.random() * 90000).toString()}`,
              })
            }
          >
            <PlusCircle className="w-4 h-4 mr-2 text-primary" /> Add{" "}
            {fields.length === 0 ? "a " : "another "}
            client
          </Button>
          {errors.clients && (
            <p className="text-sm font-medium text-destructive">
              {clientsArrayError}
            </p>
          )}
        </div>
      </div>
    </FormSpacerWrapper>
  );
}
