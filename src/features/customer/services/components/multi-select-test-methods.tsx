import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Control } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Updated to match the provided schema and renamed to TestMethod
export type TestMethod = {
  _id: string;
  code: string | null;
  description: string | null;
  standard: {
    _id: string;
    name: string | null;
    acronym: string | null;
  } | null;
};

interface MultiSelectTestMethodProps {
  testMethods: TestMethod[];
  placeholder?: string;
  emptyMessage?: string;
  name: string;
  control: Control<any>;
  label?: string;
  description?: string;
}

export function MultiSelectTestMethodField({
  testMethods,
  placeholder = "Select test methods",
  emptyMessage = "No test methods found.",
  name,
  control,
  label,
  description,
}: MultiSelectTestMethodProps) {
  return (
    <FormField
      control={control}
      name={name}
      rules={{ required: "At least one test method must be selected." }} // {{ edit_1 }}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel required>{label}</FormLabel>}
          <FormControl>
            <MultiSelect
              testMethods={testMethods}
              placeholder={placeholder}
              emptyMessage={emptyMessage}
              value={field.value}
              onChange={field.onChange}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface MultiSelectControlProps {
  testMethods: TestMethod[];
  placeholder?: string;
  emptyMessage?: string;
  value: string[]; // Array of testMethod _ids
  onChange: (value: string[]) => void;
}

export function MultiSelect({
  testMethods,
  placeholder = "Select test methods...",
  emptyMessage = "No test methods found.",
  value = [],
  onChange,
}: MultiSelectControlProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>(value);

  // Update internal state when external value changes
  React.useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleSelect = (testMethodId: string) => {
    const newSelected = selected.includes(testMethodId)
      ? selected.filter((id) => id !== testMethodId)
      : [...selected, testMethodId];

    setSelected(newSelected);
    onChange(newSelected);
  };

  const handleRemove = (testMethodId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newSelected = selected.filter((id) => id !== testMethodId);
    setSelected(newSelected);
    onChange(newSelected);
  };

  // Helper function to get display text for a test method
  const getTestMethodDisplayText = (testMethod: TestMethod) => {
    if (testMethod.code) {
      return testMethod.standard?.acronym
        ? `${testMethod.code}`
        : testMethod.code;
    }
    return testMethod.description || "Unnamed Test Method";
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1">
        <AnimatePresence initial={false}>
          {selected.map((testMethodId) => {
            const testMethod = testMethods.find(
              (tm) => tm._id === testMethodId
            );
            if (!testMethod) return null;

            return (
              <motion.div
                key={testMethodId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="flex items-center border border-green-500 rounded-md px-2 py-1 gap-8 mb-1 text-xs text-green-600"
              >
                {getTestMethodDisplayText(testMethod)}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-2 text-green-600 hover:text-green-800 hover:bg-transparent"
                  onClick={(e) => handleRemove(testMethodId, e)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">
                    Remove {getTestMethodDisplayText(testMethod)}
                  </span>
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selected.length > 0
              ? `${selected.length} test method${selected.length > 1 ? "s" : ""} selected`
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search test methods..." />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {testMethods.map((testMethod) => (
                  <CommandItem
                    key={testMethod._id}
                    value={testMethod._id}
                    onSelect={() => handleSelect(testMethod._id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(testMethod._id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{getTestMethodDisplayText(testMethod)}</span>
                      {testMethod.description && testMethod.code && (
                        <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                          {testMethod.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
