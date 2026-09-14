"use client";

import { useState } from "react";
import { AlertTriangle, MessageSquareMore } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";

interface RevisionNotesDialogProps {
  revisionText: string;
  onReject?: () => void;
  onAcceptAndRevise?: () => void;
}

export function RevisionNotesDialog({
  revisionText,
  onReject,
  onAcceptAndRevise,
}: RevisionNotesDialogProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [open, setOpen] = useState(false);
  const canAct = Boolean(onReject && onAcceptAndRevise);

  const handleReject = () => {
    setOpen(false);
    window.setTimeout(() => onReject?.(), 150);
  };

  const handleAcceptAndRevise = () => {
    setOpen(false);
    window.setTimeout(() => onAcceptAndRevise?.(), 150);
  };

  const notes = (
    <div className="rounded-lg border bg-muted/50 p-4 max-h-[50vh] overflow-y-auto">
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {revisionText || "No revision notes were provided."}
      </p>
    </div>
  );

  const actions = canAct ? (
    <>
      <Button variant="destructive" onClick={handleReject}>
        Reject Revisions
      </Button>
      <Button onClick={handleAcceptAndRevise}>Accept and Revise</Button>
    </>
  ) : (
    <Button onClick={() => setOpen(false)}>Got it</Button>
  );

  const trigger = canAct ? (
    <Button size="sm">Review the Request</Button>
  ) : (
    <Button variant="secondary" size="icon">
      <MessageSquareMore className="h-4 w-4 animate-bounce" />
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <DrawerTitle>Client Revisions Requested</DrawerTitle>
            </div>
            <DrawerDescription>
              Please review the following revision requests from the client.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-2">{notes}</div>
          <DrawerFooter className="pt-2">{actions}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <DialogTitle>Client Revisions Requested</DialogTitle>
          </div>
          <DialogDescription>
            Please review the following revision requests from the client.
          </DialogDescription>
        </DialogHeader>
        {notes}
        <DialogFooter>{actions}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
