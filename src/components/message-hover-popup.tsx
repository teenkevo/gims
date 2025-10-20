"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckCircle, Star, Loader2, X } from "lucide-react";
import { markMessageAsOfficial, unmarkMessageAsOfficial } from "@/lib/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MessageHoverPopupProps {
  rfiId: string;
  messageKey: string;
  isOfficialResponse: boolean;
  children: React.ReactNode;
  onMessageUpdate?: () => void;
}

export function MessageHoverPopup({
  rfiId,
  messageKey,
  isOfficialResponse,
  children,
  onMessageUpdate,
}: MessageHoverPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMarkAsOfficial = () => {
    startTransition(async () => {
      try {
        const result = await markMessageAsOfficial(rfiId, messageKey);

        if (result.status === "ok") {
          toast.success("Message marked as official response");
          setIsOpen(false);
          onMessageUpdate?.();
        } else {
          toast.error("Failed to mark message as official");
        }
      } catch (error) {
        console.error("Error marking message as official:", error);
        toast.error("Failed to mark message as official");
      }
    });
  };

  const handleUnmarkAsOfficial = () => {
    startTransition(async () => {
      try {
        const result = await unmarkMessageAsOfficial(rfiId, messageKey);

        if (result.status === "ok") {
          toast.success("Message unmarked as official response");
          setIsOpen(false);
          onMessageUpdate?.();
        } else {
          toast.error("Failed to unmark message as official");
        }
      } catch (error) {
        console.error("Error unmarking message as official:", error);
        toast.error("Failed to unmark message as official");
      }
    });
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative group">{children}</div>
        </PopoverTrigger>
        <PopoverContent
          className="w-64 p-3 z-50"
          side="top"
          align="center"
          sideOffset={8}
        >
          <div className="space-y-3">
            {isOfficialResponse ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    Official Response
                  </span>
                </div>
                <Button
                  onClick={handleUnmarkAsOfficial}
                  disabled={isPending}
                  size="sm"
                  variant="outline"
                  className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {isPending ? "Unmarking..." : "Remove Official Status"}
                  </span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleMarkAsOfficial}
                disabled={isPending}
                size="sm"
                variant="outline"
                className="w-full justify-start gap-2"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Star className="text-primary w-4 h-4" />
                )}
                <span className="text-sm">
                  {isPending ? "Marking..." : "Mark as Official"}
                </span>
              </Button>
            )}

            <div className="text-xs text-muted-foreground">
              The official response carries more weight in RFI resolution.
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Background overlay */}
      {mounted &&
        isOpen &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-200"
            onClick={() => setIsOpen(false)}
          />,
          document.body
        )}
    </>
  );
}
