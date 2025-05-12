import type React from "react";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

interface VATToggleProps {
  value?: string;
  onChange?: (value: string) => void;
  vatEnabled: boolean;
  setVatEnabled: (value: boolean) => void;
}

export default function VATToggle({
  value: propValue,
  onChange,
  vatEnabled,
  setVatEnabled,
}: VATToggleProps) {
  const [internalValue, setInternalValue] = useState(propValue || "18");
  const [error, setError] = useState("");

  const handleVatToggle = (checked: boolean) => {
    setVatEnabled(checked);
    if (!checked) {
      setError("");
    } else if (internalValue === "") {
      setError("VAT percentage is required");
    }
  };

  // Update internal value when prop changes
  useEffect(() => {
    if (propValue) {
      setInternalValue(propValue);
    }
  }, [propValue]);

  const handleVatPercentageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Only allow numbers and ensure it's a valid percentage
    const value = e.target.value.replace(/[^0-9.]/g, "");
    const parsedValue = Number.parseFloat(value);

    if (value === "") {
      setInternalValue(value);
      onChange?.(value);
      setError("VAT percentage is required");
    } else if (parsedValue > 100) {
      setInternalValue(value);
      setError("VAT percentage cannot exceed 100%");
    } else if (parsedValue >= 0 && parsedValue <= 100) {
      setInternalValue(value);
      onChange?.(value);
      setError("");
    }
  };

  const handleBlur = () => {
    if (internalValue === "") {
      setError("VAT percentage is required");
    }
  };

  return (
    <Card className="w-full bg-muted/20">
      <CardContent className="p-4 pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="vat-toggle"
                className="flex items-center text-base"
              >
                <ShieldCheck className="w-5 h-5 mr-2 text-primary" />
                VAT
              </Label>
              <p className="text-[0.8rem] text-muted-foreground">
                Enable or disable VAT for this quotation
              </p>
            </div>
            <Switch
              id="vat-toggle"
              checked={vatEnabled}
              onCheckedChange={handleVatToggle}
              aria-label="Toggle VAT"
            />
          </div>

          {vatEnabled && (
            <div className="space-y-2 pt-2 animate-in fade-in duration-200">
              <Label htmlFor="vat-percentage" className="text-sm">
                VAT Percentage (%) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="vat-percentage"
                  type="text"
                  value={internalValue}
                  onChange={handleVatPercentageChange}
                  onBlur={handleBlur}
                  className={`pr-8 ${error ? "border-destructive" : ""}`}
                  aria-label="VAT percentage"
                  aria-required="true"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
