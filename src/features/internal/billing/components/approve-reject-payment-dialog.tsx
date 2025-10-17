"use client";

import React, { useMemo, useState } from "react";
import { Document, pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { PaymentReceipt } from "./payment-receipt";
import { PROJECT_BY_ID_QUERYResult } from "../../../../../sanity.types";
import { approvePayment, rejectPayment } from "@/lib/actions";
import { ResponsiveActionDialog } from "./responsive-action-dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Payments } from "./make-payment-dialog";

interface ApproveRejectPaymentDialogProps {
  project: PROJECT_BY_ID_QUERYResult[number];
  quotation: NonNullable<PROJECT_BY_ID_QUERYResult[number]["quotation"]>;
  payment: Payments[number];
  resubmissionKey?: string;
}

export const ApproveRejectPaymentDialog = ({
  project,
  quotation,
  payment,
  resubmissionKey,
}: ApproveRejectPaymentDialogProps) => {
  // Generate receipt number and date
  const receiptNumber = `RCP-${quotation.quotationNumber?.slice(-14)}`;
  const receiptDate = new Date().toISOString();

  const [notes, setNotes] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");

  const ReceiptDocument = useMemo(
    () => (
      <Document>
        <PaymentReceipt
          project={project}
          quotation={quotation}
          payment={payment}
          receiptNumber={receiptNumber}
          receiptDate={receiptDate}
        />
      </Document>
    ),
    [project, quotation, payment, receiptNumber, receiptDate]
  );

  const approveAction = async (_: void | null) => {
    try {
      const blob = await pdf(ReceiptDocument).toBlob();
      const formData = new FormData();
      formData.append("files", blob, `Payment-Receipt-${receiptNumber}.pdf`);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const fileResult = await response.json();
      await approvePayment(
        quotation._id,
        fileResult.files[0].fileId,
        payment._key,
        resubmissionKey,
        notes
      );
      toast.success("Payment approved and receipt generated");
    } catch (error) {
      toast.error("Failed to generate payment receipt");
    }
  };

  const rejectAction = async (_: void | null) => {
    if (!rejectNotes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    try {
      await rejectPayment(
        quotation._id,
        payment._key,
        rejectNotes,
        resubmissionKey
      );
      toast.success("Payments resubmission rejected");
    } catch (error) {
      toast.error("Failed to reject payment");
    }
  };

  return (
    <div className="flex gap-2">
      <ResponsiveActionDialog
        title="Reject Payment"
        description="Reject this payment and provide a reason"
        trigger={
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            size="sm"
          >
            Reject
          </Button>
        }
        actionButtonText="Reject Payment"
        action={rejectAction}
        disabled={rejectNotes.trim() === ""}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Reject client's payment of{" "}
            <span className="font-semibold text-primary ml-1">
              {quotation?.currency?.toUpperCase()}{" "}
              {payment.amount?.toLocaleString()}
            </span>
          </div>
        </div>
        <div
          key={payment.paymentProof?.asset?._id}
          className="flex flex-wrap items-center justify-between bg-muted/50 p-4 rounded-lg gap-4"
        >
          <div className="flex items-center">
            <div className="bg-red-600 dark:bg-red-500 p-2 rounded mr-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <Link
              className="hover:underline underline-offset-2 transition-all"
              href={payment.paymentProof?.asset?.url || ""}
              target="_blank"
            >
              <p className="font-medium">
                {payment.paymentProof?.asset?.originalFilename}
              </p>
              <p className="text-xs text-muted-foreground">
                {payment.paymentProof?.asset?.mimeType?.toUpperCase()} •{" "}
                {(
                  (payment.paymentProof?.asset?.size || 0) /
                  (1024 * 1024)
                ).toFixed(2) + " MB"}
              </p>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Link
                className="flex items-center"
                href={payment.paymentProof?.asset?.url || ""}
                target="_blank"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Reason for rejection <span className="text-red-500">*</span>
          </p>
          <Textarea
            placeholder="Provide a reason for rejecting this payment"
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            rows={4}
            required
          />
        </div>
      </ResponsiveActionDialog>

      <ResponsiveActionDialog
        title="Approve Payment"
        description="Approve this payment to automatically generate a receipt"
        triggerButtonText="Approve"
        actionButtonText="Approve Payment"
        action={approveAction}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Review client's payment of{" "}
            <span className="font-semibold text-primary ml-1">
              {quotation?.currency?.toUpperCase()}{" "}
              {payment.amount?.toLocaleString()}
            </span>
          </div>
        </div>
        <div
          key={payment.paymentProof?.asset?._id}
          className="flex flex-wrap items-center justify-between bg-muted/50 p-4 rounded-lg gap-4"
        >
          <div className="flex items-center">
            <div className="bg-red-600 dark:bg-red-500 p-2 rounded mr-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <Link
              className="hover:underline underline-offset-2 transition-all"
              href={payment.paymentProof?.asset?.url || ""}
              target="_blank"
            >
              <p className="font-medium">
                {payment.paymentProof?.asset?.originalFilename}
              </p>
              <p className="text-xs text-muted-foreground">
                {payment.paymentProof?.asset?.mimeType?.toUpperCase()} •{" "}
                {(
                  (payment.paymentProof?.asset?.size || 0) /
                  (1024 * 1024)
                ).toFixed(2) + " MB"}
              </p>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Link
                className="flex items-center"
                href={payment.paymentProof?.asset?.url || ""}
                target="_blank"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Internal Notes (optional)
          </p>
          <Textarea
            placeholder="Add internal notes or reason for decision"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>
      </ResponsiveActionDialog>
    </div>
  );
};
