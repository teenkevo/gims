"use client";

import React, { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useActionState } from "react";

type ResponsiveActionDialogProps = {
  title: string;
  description?: string;
  trigger?: React.ReactNode;
  triggerButtonText?: string;
  actionButtonText?: string;
  // The action to run when clicking the internal action button
  action: (_: void | null) => Promise<void>;
  // Optional custom content inside the dialog body (above the action button)
  children?: React.ReactNode;
  // Disable the action button
  disabled?: boolean;
};

export function ResponsiveActionDialog({
  title,
  description,
  trigger,
  triggerButtonText = "Open",
  actionButtonText = "Continue",
  action,
  children,
  disabled,
}: ResponsiveActionDialogProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [open, setOpen] = useState(false);

  const [result, dispatch, isPending] = useActionState(action, null);

  useEffect(() => {
    if (!isPending && result !== null) {
      setOpen(false);
    }
  }, [isPending, result]);

  const content = (
    <div className="space-y-4 py-2">
      {children}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          disabled={disabled || isPending}
          onClick={() => React.startTransition(() => dispatch())}
        >
          {isPending ? "Processing..." : actionButtonText}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {trigger ?? <Button size="sm">{triggerButtonText}</Button>}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
            {description ? (
              <DrawerDescription className="text-xs">
                {description}
              </DrawerDescription>
            ) : null}
          </DrawerHeader>
          <div className="p-4 pb-0 max-h-[400px] overflow-y-auto">
            {content}
          </div>
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button size="sm">{triggerButtonText}</Button>}
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-md flex flex-col max-h-[600px]"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-xs">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-1">{content}</div>
      </DialogContent>
    </Dialog>
  );
}
