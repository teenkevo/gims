"use client";

import * as React from "react";
import { Landmark } from "lucide-react";

import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const currencies = [
  {
    value: "ugx",
    label: "UGX",
  },
  {
    value: "usd",
    label: "USD",
  },
  {
    value: "eur",
    label: "EUR",
  },
  {
    value: "gbp",
    label: "GBP",
  },
];

interface CurrencyToggleProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function CurrencyToggle({
  value: propValue,
  onChange,
}: CurrencyToggleProps) {
  const [internalValue, setInternalValue] = React.useState(propValue || "ugx");

  // Update internal value when prop changes
  React.useEffect(() => {
    if (propValue) {
      setInternalValue(propValue);
    }
  }, [propValue]);

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <p className="text-sm font-medium tracking-tight after:ml-0.5 after:text-destructive after:content-['*']">
          Select the currency
        </p>
      </div>
      <ToggleGroup
        type="single"
        value={internalValue}
        onValueChange={(value) => {
          if (value) handleValueChange(value);
        }}
        className="justify-start flex flex-wrap gap-2"
      >
        {currencies.map((currency) => (
          <ToggleGroupItem
            variant="default"
            key={currency.value}
            value={currency.value}
            aria-label={`Select ${currency.label}`}
            className={cn(
              "flex items-center gap-1 px-3 py-2 relative border border-dotted",
              internalValue === currency.value && "font-medium"
            )}
          >
            {internalValue === currency.value && (
              <Landmark className="w-4 h-4 text-primary absolute left-2 animate-in fade-in slide-in-from-left-1 duration-300" />
            )}
            <span
              className={cn(
                "transition-all duration-300",
                internalValue === currency.value && "ml-6"
              )}
            >
              {currency.label}
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
