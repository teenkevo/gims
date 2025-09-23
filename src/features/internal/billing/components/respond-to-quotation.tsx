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
} from "@/components/ui/drawer";
import { ButtonLoading } from "@/components/button-loading";
import { toast } from "sonner";
import { useActionState } from "react";
import { createInvoice, respondToQuotation } from "@/lib/actions";
import { Check, MessageSquareReply, Send, X } from "lucide-react";
import type { PROJECT_BY_ID_QUERYResult } from "../../../../../sanity.types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuotation } from "./useQuotation";
import { useRBAC } from "@/components/rbac-context";
import { Document, pdf, PDFViewer } from "@react-pdf/renderer";
import { BillingDocument } from "./billingDocument";
import { InvoiceDocument } from "./invoice-document";

export function RespondToQuotationDialog({
  project,
}: {
  project: PROJECT_BY_ID_QUERYResult[number];
}) {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState<
    "accepted" | "rejected" | "revisions_requested"
  >("accepted");
  const [rejectionNotes, setRejectionNotes] = React.useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { role } = useRBAC();

  const { quotation } = useQuotation(project, role);

  const fieldTests = quotation?.items?.filter(
    (item) => item.service?.sampleClass?.name === "Field"
  );

  const labTests = quotation?.items?.filter(
    (item) => item.service?.sampleClass?.name !== "Field"
  );

  const mobilizationActivities = quotation?.otherItems?.filter(
    (item) => item.type === "mobilization"
  );

  const reportingActivities = quotation?.otherItems?.filter(
    (item) => item.type === "reporting"
  );

  const Doc = (
    <Document>
      <InvoiceDocument
        isInvoice={true}
        revisionNumber={quotation?.revisionNumber || ""}
        quotationNumber={quotation?.quotationNumber?.replace("Q", "INV") || ""}
        quotationDate={quotation?.quotationDate || ""}
        acquisitionNumber={quotation?.acquisitionNumber || ""}
        currency={quotation?.currency || ""}
        labTests={labTests || []}
        fieldTests={fieldTests || []}
        reportingActivities={reportingActivities || []}
        mobilizationActivities={mobilizationActivities || []}
        project={project}
        paymentNotes={quotation?.paymentNotes || ""}
        vatPercentage={quotation?.vatPercentage || 0}
        advance={quotation?.advance || 0}
      />
    </Document>
  );

  const action = async (_: void | null) => {
    if (!quotation) {
      toast.error("Quotation not found");
      return;
    }

    if (status === "accepted") {
      const blob = await pdf(Doc).toBlob();
      const formData = new FormData();
      formData.append(
        "files",
        blob,
        `Invoice-${quotation?.quotationNumber?.replace("Q", "INV")}.pdf`
      );
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const fileResult = await response.json();
      await createInvoice(quotation._id, fileResult.files[0].fileId);
    }

    // For rejection, we need to create a new revision
    const result = await respondToQuotation(
      quotation._id,
      status,
      rejectionNotes
    );

    if (result.status === "ok") {
      if (status === "rejected") {
        toast.success("Quotation has been rejected and moved to revision");
      } else if (status === "revisions_requested") {
        toast.success("Quotation has been sent back to GETLAB for revisions");
      } else {
        toast.success("Quotation has been accepted and sent to client");
      }
      setOpen(false);
    } else {
      toast.error("Something went wrong");
    }
  };

  const [_, dispatch, isPending] = useActionState(action, null);

  const getActionButton = () => {
    if (isPending) {
      return <ButtonLoading />;
    }

    return (
      <Button
        onClick={() => React.startTransition(() => dispatch())}
        type="submit"
        variant={status === "accepted" ? "default" : "destructive"}
        disabled={status === "revisions_requested" && !rejectionNotes.trim()}
      >
        {status === "accepted" ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Accept
          </>
        ) : status === "revisions_requested" ? (
          <>
            <Send className="w-4 h-4 mr-2" />
            Request revision
          </>
        ) : (
          <>
            <X className="w-4 h-4 mr-2" />
            Reject
          </>
        )}
      </Button>
    );
  };

  const getStatusOptions = () => (
    <RadioGroup
      value={status}
      onValueChange={(value) =>
        setStatus(value as "accepted" | "rejected" | "revisions_requested")
      }
      className="flex flex-col space-y-3 mt-4"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="accepted" id="accept" />
        <Label htmlFor="accept" className="font-medium">
          Accept quotation
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="rejected" id="reject" />
        <Label htmlFor="reject" className="font-medium">
          Reject quotation
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="revisions_requested" id="request-revision" />
        <Label htmlFor="request-revision" className="font-medium">
          Request revision
        </Label>
      </div>
    </RadioGroup>
  );

  const getRejectionNotesField = () => {
    if (status !== "revisions_requested") return null;

    return (
      <div className="mt-4 space-y-2">
        <Label htmlFor="rejection-notes" className="font-medium">
          Rejection Notes
        </Label>
        <Textarea
          id="rejection-notes"
          className="min-h-[120px] resize-y"
          placeholder="Please provide details for the revision"
          value={rejectionNotes}
          onChange={(e) => setRejectionNotes(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Accepting / rejecting the revisions is at GETLAB&apos;s discretion.
        </p>
      </div>
    );
  };

  const getWarningMessage = () => {
    if (status === "accepted") {
      return (
        <div className="bg-primary/10 text-primary p-3 rounded text-sm">
          <span className="font-bold">All Good 👍 </span>: Upon accepting, a
          payable invoice will be issued immediately.
        </div>
      );
    } else if (status === "revisions_requested") {
      return (
        <div className="bg-orange-500/10 text-orange-500 p-3 rounded text-sm">
          <span className="font-bold">Warning</span>: This action will send the
          quotation back to GETLAB for revisions.
        </div>
      );
    }

    return (
      <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
        <span className="font-bold">Warning</span>: This action will reject the
        quotation and halt the project at this stage.
      </div>
    );
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <MessageSquareReply className="w-4 h-4 mr-2" />
            Respond
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader className="space-y-3">
            <DialogTitle>Accept or reject quotation</DialogTitle>
            <DialogDescription>
              Choose whether to accept or reject this quotation.
            </DialogDescription>
            {getStatusOptions()}
            {getRejectionNotesField()}
            {getWarningMessage()}
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {getActionButton()}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <MessageSquareReply className="w-4 h-4 mr-2" />
          Respond
        </Button>
      </DialogTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-3 text-left">
          <DialogTitle>Respond to quotation</DialogTitle>
          <DialogDescription>
            Choose whether to accept or reject this quotation.
          </DialogDescription>
          {getStatusOptions()}
          {getWarningMessage()}
        </DrawerHeader>

        <DrawerFooter className="pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          {getActionButton()}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
