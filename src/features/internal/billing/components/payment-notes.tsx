"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface PaymentNotesProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function PaymentNotes({
  value: propValue,
  onChange,
}: PaymentNotesProps) {
  const [notesEnabled, setNotesEnabled] = useState(false);
  const [internalValue, setInternalValue] = useState(propValue || "");
  const [error, setError] = useState("");

  const MAX_CHARS = 200;

  const handleNotesToggle = (checked: boolean) => {
    setNotesEnabled(checked);
    if (!checked) {
      setError("");
    } else if (internalValue.trim() === "") {
      setError("Payment notes are required");
    }
  };

  // Update internal value when prop changes
  useEffect(() => {
    if (propValue) {
      setInternalValue(propValue);
    }
  }, [propValue]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    if (value.length <= MAX_CHARS) {
      setInternalValue(value);
      onChange?.(value);

      if (value.trim() === "") {
        setError("Payment notes are required");
      } else {
        setError("");
      }
    }
  };

  const handleBlur = () => {
    if (notesEnabled && internalValue.trim() === "") {
      setError("Payment notes are required");
    }
  };

  return (
    <Card className="w-full bg-muted/20">
      <CardContent className="p-4 pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="notes-toggle"
                className="flex items-center text-base"
              >
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Payment Notes
              </Label>
              <p className="text-[0.8rem] text-muted-foreground">
                Add special instructions for payment
              </p>
            </div>
            <Switch
              id="notes-toggle"
              checked={notesEnabled}
              onCheckedChange={handleNotesToggle}
              aria-label="Toggle Payment Notes"
            />
          </div>

          {notesEnabled && (
            <div className="space-y-2 pt-2 animate-in fade-in duration-200">
              <Label htmlFor="payment-notes" className="text-sm">
                Notes <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="payment-notes"
                value={internalValue}
                onChange={handleNotesChange}
                onBlur={handleBlur}
                className={`resize-none min-h-[100px] ${error ? "border-destructive" : ""}`}
                placeholder="Enter payment instructions or notes..."
                aria-label="Payment notes"
                aria-required="true"
                required
              />
              <div className="flex justify-between items-center text-[0.8rem]">
                {error ? (
                  <p className="text-destructive">{error}</p>
                ) : (
                  <span className="text-muted-foreground">
                    Special instructions for payment
                  </span>
                )}
                <span
                  className={`${internalValue.length >= MAX_CHARS ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {internalValue.length}/{MAX_CHARS}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
