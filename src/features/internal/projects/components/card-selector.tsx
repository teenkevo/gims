import type React from "react";
import { cn } from "@/lib/utils";

interface CardSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
    icon: React.ReactNode;
  }[];
  disabled?: boolean;
}

export function CardSelector({
  value,
  onChange,
  options,
  disabled,
}: CardSelectorProps) {
  return (
    <div className="flex space-x-4 my-4">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          disabled={disabled}
          className={cn(
            "flex flex-col items-center justify-center w-full md:w-40 h-20 bg-popover rounded-lg border-2 p-4 transition-all duration-200 ease-in-out",
            "hover:bg-accent hover:text-accent-foreground cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed",
            value === option.value
              ? "border-primary text-primary"
              : "border-muted bg-background text-foreground"
          )}
        >
          {option.icon}
          <span className="text-sm font-medium mt-2">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
