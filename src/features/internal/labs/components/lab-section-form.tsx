"use client";

import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LabSectionForm({
  title,
  description,
  children,
  savable = true,
  showFooter = true,
  isSubmitting = false,
  isDirty = false,
  hasError = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  savable?: boolean;
  showFooter?: boolean;
  isSubmitting?: boolean;
  isDirty?: boolean;
  hasError?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-gradient-to-b from-muted/20 to-muted/40">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showFooter && (
        <div className="flex items-center justify-between border-t bg-muted/50 px-6 py-4">
          <span className="flex flex-wrap items-center gap-2 text-sm">
            Learn about
            <button
              type="button"
              onClick={() =>
                toast("🧑‍🍳 In the kitchen...", {
                  description:
                    "GIMS documentation is still in active development. Check back later",
                })
              }
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              {title}
              <ExternalLink className="ml-1 h-4 w-4" />
            </button>
          </span>
          {savable && (
            <Button
              type="submit"
              disabled={isSubmitting || !isDirty || hasError}
            >
              {isSubmitting ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
