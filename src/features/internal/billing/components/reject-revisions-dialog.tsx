"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
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
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { DestructiveButtonLoading } from "@/components/button-loading";
import { toast } from "sonner";
import { useActionState } from "react";
import { rejectQuotationRevisions } from "@/lib/actions";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toastActionError } from "@/lib/auth/notify-action-error";

export function RejectRevisionsDialog({
  quotationId,
  projectId,
  revisionText,
  open: controlledOpen,
  onOpenChange,
}: {
  quotationId: string;
  projectId: string;
  revisionText: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;
  const [reason, setReason] = React.useState("");
  const reasonRef = React.useRef(reason);
  reasonRef.current = reason;
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const action = async (_: void | null) => {
    const result = await rejectQuotationRevisions(
      quotationId,
      reasonRef.current,
      projectId
    );
    if (result.status === "ok") {
      toast.success(
        "Revision request declined. The original quotation has been sent back to the client."
      );
      setOpen(false);
      setReason("");
    } else {
      toastActionError(result);
    }
  };

  const [_, dispatch, isPending] = useActionState(action, null);
  const canSubmit = reason.trim().length > 0;
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen && !isPending) {
      setReason("");
    }
  };

  const trigger = isControlled ? null : (
    <Button variant="destructive" size="sm">
      Reject revisions
    </Button>
  );

  const form = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="font-medium">Client revision request</Label>
        <div className="rounded-lg border bg-muted/50 p-4 max-h-[30vh] overflow-y-auto">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {revisionText || "No revision notes were provided."}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="revision-decline-reason" className="font-medium">
          Reason for declining
        </Label>
        <Textarea
          autoFocus
          id="revision-decline-reason"
          className="min-h-[120px] resize-y"
          placeholder="Explain why GETLAB will not make the requested changes"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          disabled={isPending}
          required
        />
      </div>
      <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
        <span className="font-bold">Warning</span>: The original quotation will be sent back to the client.
      </div>
    </div>
  );

  const actions = (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(false)}
        disabled={isPending}
      >
        Cancel
      </Button>
      {isPending ? (
        <DestructiveButtonLoading />
      ) : (
        <Button
          variant="destructive"
          onClick={() => React.startTransition(() => dispatch())}
          disabled={!canSubmit}
        >
          <X className="w-4 h-4 mr-2" />
          Reject revisions
        </Button>
      )}
    </>
  );

  if (isDesktop) {
    return (
      <Dialog loading={isPending} open={open} onOpenChange={handleOpenChange}>
        {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="space-y-3">
            <DialogTitle>Reject revision request</DialogTitle>
            <DialogDescription>
              Decline the client&apos;s requested changes.
            </DialogDescription>
          </DialogHeader>
          {form}
          <DialogFooter>{actions}</DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer loading={isPending} open={open} onOpenChange={handleOpenChange}>
      {trigger ? <DrawerTrigger asChild>{trigger}</DrawerTrigger> : null}
      <DrawerContent>
        <DrawerHeader className="gap-3 text-left">
          <DialogTitle>Reject revision request</DialogTitle>
          <DialogDescription>
            Decline the client&apos;s requested changes.
          </DialogDescription>
        </DrawerHeader>
        <div className="px-4 pb-2">{form}</div>
        <DrawerFooter className="pt-2">{actions}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
