"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface MultiSelectOption {
  label: string;
  value: string;
  description?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxDisplay?: number;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select items...",
  disabled = false,
  className,
  maxDisplay = 3,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemove = (optionValue: string) => {
    onChange(value.filter((item) => item !== optionValue));
  };

  const selectedOptions = options.filter((option) =>
    value.includes(option.value)
  );

  const displayText = React.useMemo(() => {
    if (value.length === 0) return placeholder;
    if (value.length <= maxDisplay) {
      return selectedOptions.map((option) => option.label).join(", ");
    }
    return `${value.length} items selected`;
  }, [value, selectedOptions, maxDisplay, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left font-normal",
            !value.length && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center space-x-2 px-3 py-2 hover:bg-accent cursor-pointer"
              onClick={() => handleSelect(option.value)}
            >
              <Checkbox
                checked={value.includes(option.value)}
                onChange={() => handleSelect(option.value)}
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-xs text-muted-foreground">
                    {option.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedOptions.slice(0, maxDisplay).map((option) => (
            <Badge key={option.value} variant="secondary" className="text-xs">
              {option.label}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 hover:bg-transparent"
                onClick={() => handleRemove(option.value)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {value.length > maxDisplay && (
            <Badge variant="secondary" className="text-xs">
              +{value.length - maxDisplay} more
            </Badge>
          )}
        </div>
      )}
    </Popover>
  );
}
