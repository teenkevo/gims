"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  CheckCircle,
  Download,
  Loader,
  XCircle,
  Eye,
  ExternalLink,
  Banknote,
  HandCoins,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import type { PROJECT_BY_ID_QUERYResult } from "../../../../../sanity.types";
import Link from "next/link";
import type { Payments } from "./make-payment-dialog";
import { ApproveRejectPaymentDialog } from "./approve-reject-payment-dialog";
import { RemakePaymentDialog } from "./remake-payment";
import { calculatePaymentStatus } from "./billing-lifecycle";
import { MakePaymentDialog } from "./make-payment-dialog";

type Quotation = NonNullable<PROJECT_BY_ID_QUERYResult[number]["quotation"]>;

export function ViewPaymentsDialog({
  quotationId,
  total,
  currency,
  existingPayments = [],
  project,
  quotation,
}: {
  quotationId: string;
  currency: string;
  total: number;
  existingPayments?: Payments;
  project: PROJECT_BY_ID_QUERYResult[number];
  quotation: Quotation;
}) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const formatAmount = (amount?: number) => {
    const formattedAmount = amount?.toLocaleString() || "0";
    return `${formattedAmount}`;
  };

  const paymentStatus = calculatePaymentStatus(quotation);

  const { totalApprovedPayments, allClear } = paymentStatus;

  const paymentsViewContent = (
    <div className="space-y-4 py-4">
      <div className="space-y-1 mb-10">
        <div className="flex items-center justify-between">
          <h3 className=" font-semibold">Summary</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          <div className="border-2 rounded-lg border-muted bg-popover p-4">
            <Badge variant="outline">Total Invoice</Badge>
            <div className="mt-4">
              <div className="text-xs text-muted-foreground">
                {currency?.toUpperCase()}
              </div>
              <div className="font-semibold md:text-xl">
                {formatAmount(total)}
              </div>
            </div>
          </div>

          <div className="border-2 rounded-lg bg-popover p-4">
            <Badge variant="outline" className="text-primary ">
              Received & Approved
            </Badge>
            <div className="mt-4">
              <div className="text-xs text-muted-foreground">
                {currency?.toUpperCase()}
              </div>
              <div className="font-semibold md:text-xl">
                {formatAmount(totalApprovedPayments)}
              </div>
            </div>
          </div>
          <div className="border-2 rounded-lg bg-popover p-4">
            <Badge variant="outline" className="text-orange-600 ">
              Pending
            </Badge>
            <div className="mt-4">
              <div className="text-xs text-muted-foreground">
                {currency?.toUpperCase()}
              </div>
              <div className="font-semibold md:text-xl">
                {formatAmount(total - (totalApprovedPayments || 0))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">History</h4>
        {existingPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <HandCoins className="w-10 h-10 text-muted-foreground" />
            <div className="text-sm text-muted-foreground text-center">
              No payments recorded yet
            </div>
            <MakePaymentDialog
              quotationId={quotation?._id}
              total={quotation?.grandTotal as number}
              currency={quotation?.currency as string}
              advancePercentage={quotation?.advance || 0}
              existingPayments={quotation?.payments || []}
            />
          </div>
        ) : (
          [...existingPayments]
            .slice()
            .reverse()
            .map((payment: Payments[number], index: number) => (
              <div
                key={index}
                className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-base capitalize">
                      {payment.paymentType || "Unknown"} Payment
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {project &&
                      quotation &&
                      payment.internalStatus === "pending" && (
                        <ApproveRejectPaymentDialog
                          project={project}
                          quotation={quotation}
                          payment={payment}
                        />
                      )}
                    {payment.internalStatus === "approved" &&
                      payment.receipt?.asset?.url && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="border border-primary/30"
                        >
                          <Link
                            className="flex items-center"
                            href={`${payment?.receipt?.asset?.url || ""}?dl=${payment?.receipt?.asset?.originalFilename}`}
                            target="_blank"
                          >
                            <ExternalLink className="text-primary h-4 w-4 mr-2" />
                            View Receipt
                          </Link>
                        </Button>
                      )}
                    {payment.internalStatus === "rejected" &&
                      (!payment?.resubmissions ||
                        payment?.resubmissions?.length === 0) && (
                        <RemakePaymentDialog
                          quotationId={quotationId}
                          currency={currency}
                          rejectedPayment={payment}
                        />
                      )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    <span>Amount:</span>{" "}
                    <span className="font-semibold text-foreground">
                      {formatAmount(payment.amount || 0)}
                    </span>
                  </div>
                  <div>
                    <span>Method:</span>{" "}
                    <span className="capitalize font-semibold text-foreground">
                      {payment.paymentMode || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Status:</span>{" "}
                    <span className="capitalize flex items-center gap-1 font-semibold text-foreground">
                      {payment.internalStatus
                        ? payment.internalStatus.charAt(0).toUpperCase() +
                          payment.internalStatus.slice(1)
                        : "Unknown"}{" "}
                      {payment.internalStatus === "pending" && (
                        <Loader className="w-4 h-4 text-orange-500 animate-spin" />
                      )}
                      {payment.internalStatus === "approved" && (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      )}
                      {payment.internalStatus === "rejected" && (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                    </span>
                  </div>

                  {payment.internalNotes && (
                    <div>
                      <span className="mb-5">Notes:</span>{" "}
                      <span className="text-destructive font-semibold">
                        {payment.internalNotes}
                      </span>
                    </div>
                  )}
                  {payment.resubmissions &&
                    payment.resubmissions.length > 0 && (
                      <div>
                        {[...(payment.resubmissions || [])]
                          .slice()
                          .reverse()
                          .map((resubmission, idx) => (
                            <div
                              className="mb-5 border-t border-dashed border-muted-foreground/40 my-5 pt-5"
                              key={resubmission._key}
                            >
                              <div className="flex items-center justify-between mb-5">
                                <Badge
                                  variant="outline"
                                  className="border-muted-foreground"
                                >
                                  Resubmission {idx + 1}
                                </Badge>{" "}
                                <div className="flex items-center gap-2">
                                  {resubmission.internalStatus ===
                                    "pending" && (
                                    <ApproveRejectPaymentDialog
                                      project={
                                        project as PROJECT_BY_ID_QUERYResult[number]
                                      }
                                      quotation={quotation as Quotation}
                                      payment={payment as Payments[number]}
                                      resubmissionKey={resubmission._key}
                                    />
                                  )}
                                  {resubmission.internalStatus === "approved" &&
                                    resubmission.receipt?.asset?.url && (
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        className="border border-primary/30"
                                      >
                                        <Link
                                          className="flex items-center"
                                          href={`${payment?.receipt?.asset?.url || ""}?dl=${payment?.receipt?.asset?.originalFilename}`}
                                          target="_blank"
                                        >
                                          <ExternalLink className="text-primary h-4 w-4 mr-2" />
                                          View Receipt
                                        </Link>
                                      </Button>
                                    )}
                                  {/* TODO: Add resubmission receipt */}
                                  {/* Resubmission dialog should only be shown for the last resubmission when it is rejected */}
                                  {resubmission.internalStatus === "rejected" &&
                                    idx ===
                                      (payment.resubmissions?.length || 0) -
                                        1 && (
                                      <RemakePaymentDialog
                                        quotationId={quotationId}
                                        currency={currency}
                                        rejectedPayment={payment}
                                      />
                                    )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <div>
                                    <span>Amount:</span>{" "}
                                    <span className="font-semibold text-foreground">
                                      {formatAmount(resubmission.amount || 0)}
                                    </span>
                                  </div>
                                  <div>
                                    <span>Method:</span>{" "}
                                    <span className="capitalize font-semibold text-foreground">
                                      {resubmission.paymentMode || "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span>Status:</span>{" "}
                                    <span className="capitalize flex items-center gap-1 font-semibold text-foreground">
                                      {resubmission.internalStatus
                                        ? resubmission.internalStatus
                                            .charAt(0)
                                            .toUpperCase() +
                                          resubmission.internalStatus.slice(1)
                                        : "Unknown"}{" "}
                                      {resubmission.internalStatus ===
                                        "pending" && (
                                        <Loader className="w-4 h-4 text-orange-500 animate-spin" />
                                      )}
                                      {resubmission.internalStatus ===
                                        "approved" && (
                                        <CheckCircle className="w-4 h-4 text-primary" />
                                      )}
                                      {resubmission.internalStatus ===
                                        "rejected" && (
                                        <XCircle className="w-4 h-4 text-destructive" />
                                      )}
                                    </span>
                                  </div>

                                  {resubmission.internalNotes && (
                                    <div>
                                      <span>Notes:</span>{" "}
                                      <span className="text-destructive font-semibold">
                                        {resubmission.internalNotes}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );

  return isMobile ? (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="border border-primary/30"
        >
          <Eye className="h-5 w-5 mr-2" />
          View Payments
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Payment History</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 pb-0 max-h-[400px] overflow-y-auto">
          {paymentsViewContent}
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="border border-primary/30"
        >
          <Banknote className="h-5 w-5 mr-2 text-primary" />
          View Payments
        </Button>
      </DialogTrigger>

      <DialogContent
        aria-describedby={undefined}
        className="max-w-2xl flex flex-col max-h-[600px]"
      >
        <DialogHeader>
          <DialogTitle>Payment History</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-1">{paymentsViewContent}</div>
      </DialogContent>
    </Dialog>
  );
}
