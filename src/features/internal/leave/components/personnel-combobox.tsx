"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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
import type { LeaveStaffOption } from "../types";

export function PersonnelCombobox({
  people,
  value,
  onChange,
  placeholder = "Select a colleague",
  disabled,
  excludeId,
  disabledReason,
}: {
  people: LeaveStaffOption[];
  value?: string;
  onChange: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
  excludeId?: string;
  disabledReason?: (person: LeaveStaffOption) => string | null;
}) {
  const [open, setOpen] = useState(false);

  const options = useMemo(
    () => people.filter((person) => person._id !== excludeId),
    [people, excludeId]
  );

  const selected = options.find((person) => person._id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {selected?.fullName ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search personnel..." />
          <CommandList>
            <CommandEmpty>No matching colleagues.</CommandEmpty>
            <CommandGroup>
              {options.map((person) => {
                const conflict = disabledReason?.(person) ?? null;
                return (
                  <CommandItem
                    key={person._id}
                    value={`${person.fullName ?? ""} ${person.department ?? ""}`}
                    disabled={Boolean(conflict)}
                    onSelect={() => {
                      onChange(person._id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === person._id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="min-w-0">
                      <p className="truncate">{person.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {conflict ?? person.department ?? "No department"}
                      </p>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
