"use client";

import { useMemo } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

export type DepartmentOption = {
  _id: string;
  department?: string | null;
};

export function DepartmentMultiSelect({
  options,
  selected,
  onChange,
  disabled,
}: {
  options: DepartmentOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
}) {
  const selectedOptions = useMemo(
    () => options.filter((option) => selected.includes(option._id)),
    [options, selected]
  );

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((value) => value !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            {selected.length > 0
              ? `${selected.length} department${selected.length === 1 ? "" : "s"}`
              : "Select departments"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search departments..." />
            <CommandList>
              <CommandEmpty>No departments found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option._id}
                    value={option.department ?? option._id}
                    onSelect={() => toggle(option._id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(option._id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.department ?? "Untitled department"}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <Badge key={option._id} variant="secondary" className="gap-1">
              {option.department ?? "Untitled department"}
              {!disabled && (
                <button
                  type="button"
                  className="ml-1 rounded-full outline-none hover:bg-muted"
                  onClick={() => onChange(selected.filter((id) => id !== option._id))}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
