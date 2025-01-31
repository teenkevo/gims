"use client";

// core
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";

// icons
import { Check, ChevronsUpDown, Loader } from "lucide-react"; // Assuming Loader2 is a spinner icon

// components
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
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
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { cn } from "@/lib/utils";
import { Client } from "../types";
import Formheader from "@/components/form-header";
import FormSpacerWrapper from "@/components/form-spacer-wrapper";

interface ClientProfileFormProps {
  isSubmitting: boolean;
}

export function ClientProfileForm({ isSubmitting }: ClientProfileFormProps) {
  const [open, setOpen] = useState(false);
  const form = useFormContext();

  return (
    <FormSpacerWrapper>
      <Formheader title="Create / Add Client Profile" step={2} />
      <FormField
        control={form.control}
        name="clientType"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>How do you want to add the client?</FormLabel>
            <FormControl>
              <RadioGroup
                disabled={isSubmitting}
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="new" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Create a new client
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="existing" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Choose from already existing clients
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch("clientType") === "existing" ? (
        <FormField
          control={form.control}
          name="existingClient"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Choose an existing client</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      disabled={isSubmitting || getClientsLoading}
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-auto",
                        getClientsLoading && "justify-start",
                        !getClientsLoading && "justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <AnimatePresence mode="wait">
                        {getClientsLoading ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center"
                          >
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Loading existing clients, please wait...
                          </motion.div>
                        ) : (
                          <motion.div
                            key="clientSelection"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center justify-between w-full"
                          >
                            {field.value !== undefined
                              ? existingClients?.find(
                                  (client) => client.id === field.value
                                )?.name
                              : "Select a client"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                {!getClientsLoading && (
                  <PopoverContent className="w-auto p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search client..." />
                      <CommandEmpty>No client found.</CommandEmpty>
                      <CommandGroup>
                        {existingClients?.map((client) => (
                          <CommandItem
                            disabled={isSubmitting}
                            value={client.name}
                            key={client.id}
                            onSelect={() => {
                              form.setValue("existingClient", client.id);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                client.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {client.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                )}
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <>
          <FormField
            control={form.control}
            name="newClientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client name</FormLabel>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="e.g. Paragon Construction (SG) Limited"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newClientEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client email</FormLabel>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="e.g. contact@paragon.com"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newClientPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client phone number</FormLabel>
                <FormControl>
                  <PhoneInput
                    disabled={isSubmitting}
                    placeholder="Enter a phone number e.g. +256 792 445002"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </FormSpacerWrapper>
  );
}
