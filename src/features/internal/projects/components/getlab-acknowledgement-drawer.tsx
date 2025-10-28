"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  PROJECT_BY_ID_QUERYResult,
  ALL_PERSONNEL_QUERYResult,
} from "../../../../../sanity.types";

interface GetlabAcknowledgementDrawerProps {
  children: React.ReactNode;
  project: PROJECT_BY_ID_QUERYResult[number];
  existingSampleReceipt?: PROJECT_BY_ID_QUERYResult[number]["sampleReceipt"];
  onApprovalSubmit: (data: GetlabAcknowledgementData) => Promise<void>;
}

export interface GetlabAcknowledgementData {
  approvalDecision: string;
  rejectionReason?: string;
  expectedDeliveryDate?: Date;
  sampleRetentionDuration?: number;
  getlabAcknowledgement: string;
}

export function GetlabAcknowledgementDrawer({
  children,
  project,
  existingSampleReceipt,
  onApprovalSubmit,
}: GetlabAcknowledgementDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Initialize state from existing data if available
  const [approvalDecision, setApprovalDecision] = React.useState<string>(
    existingSampleReceipt?.getlabAcknowledgement?.approvalDecision || ""
  );
  const [rejectionReason, setRejectionReason] = React.useState<string>(
    existingSampleReceipt?.getlabAcknowledgement?.rejectionReason || ""
  );
  const [expectedDeliveryDate, setExpectedDeliveryDate] = React.useState<
    Date | undefined
  >(
    existingSampleReceipt?.getlabAcknowledgement?.expectedDeliveryDate
      ? new Date(
          existingSampleReceipt.getlabAcknowledgement.expectedDeliveryDate
        )
      : undefined
  );
  const [sampleRetentionDuration, setSampleRetentionDuration] = React.useState<
    number | undefined
  >(
    existingSampleReceipt?.getlabAcknowledgement?.sampleRetentionDuration
      ? parseInt(
          existingSampleReceipt.getlabAcknowledgement.sampleRetentionDuration,
          10
        )
      : undefined
  );
  const [getlabAcknowledgement, setGetlabAcknowledgement] =
    React.useState<string>(
      existingSampleReceipt?.getlabAcknowledgement?.acknowledgementText || ""
    );

  // Update state when existingSampleReceipt changes
  React.useEffect(() => {
    if (existingSampleReceipt?.getlabAcknowledgement?.approvalDecision) {
      setApprovalDecision(
        existingSampleReceipt.getlabAcknowledgement.approvalDecision
      );
    }
    if (existingSampleReceipt?.getlabAcknowledgement?.rejectionReason) {
      setRejectionReason(
        existingSampleReceipt.getlabAcknowledgement.rejectionReason
      );
    }
    if (existingSampleReceipt?.getlabAcknowledgement?.expectedDeliveryDate) {
      setExpectedDeliveryDate(
        new Date(
          existingSampleReceipt.getlabAcknowledgement.expectedDeliveryDate
        )
      );
    } else {
      setExpectedDeliveryDate(undefined);
    }
    if (existingSampleReceipt?.getlabAcknowledgement?.sampleRetentionDuration) {
      setSampleRetentionDuration(
        parseInt(
          existingSampleReceipt.getlabAcknowledgement.sampleRetentionDuration,
          10
        )
      );
    } else {
      setSampleRetentionDuration(undefined);
    }
    if (existingSampleReceipt?.getlabAcknowledgement?.acknowledgementText) {
      setGetlabAcknowledgement(
        existingSampleReceipt.getlabAcknowledgement.acknowledgementText
      );
    }
  }, [existingSampleReceipt]);

  const handleSubmit = async () => {
    // Validation
    if (!approvalDecision) {
      toast.error("Please select an approval decision");
      return;
    }

    if (approvalDecision === "reject" && !rejectionReason?.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    if (
      approvalDecision === "approve" &&
      (!expectedDeliveryDate || !sampleRetentionDuration)
    ) {
      toast.error(
        "Expected delivery date and sample retention duration are required for approval"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onApprovalSubmit({
        approvalDecision,
        rejectionReason,
        expectedDeliveryDate,
        sampleRetentionDuration,
        getlabAcknowledgement,
      });
      setOpen(false);
      toast.success(
        `Sample receipt ${approvalDecision === "approve" ? "approved" : "rejected"} successfully!`
      );
    } catch (error) {
      console.error("Failed to submit approval:", error);
      toast.error("Failed to submit approval");
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <div className="space-y-6 p-1">
      <div>
        {/* <CardTitle className="mb-4">GETLAB's Acknowledgement</CardTitle> */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="expected-delivery-date">
              Expected delivery date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="expected-delivery-date"
                  variant="outline"
                  className={`mt-1 w-full justify-start text-left font-normal ${
                    !expectedDeliveryDate && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expectedDeliveryDate ? (
                    format(expectedDeliveryDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expectedDeliveryDate}
                  onSelect={(date) => setExpectedDeliveryDate(date)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="sample-retention">
              Duration for Sample to be Retained Incase Sample Remains After
              Testing (days)
            </Label>
            <Input
              id="sample-retention"
              type="number"
              min="0"
              placeholder="Enter number of days"
              className="mt-1"
              value={sampleRetentionDuration || ""}
              onChange={(e) => {
                const value = e.target.value;
                setSampleRetentionDuration(
                  value ? parseInt(value, 10) : undefined
                );
              }}
            />
          </div>

          {/* Approval Decision */}
          <div>
            <Label htmlFor="approval-decision">
              Approval Decision
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <RadioGroup
              value={approvalDecision}
              onValueChange={(value) => setApprovalDecision(value)}
              className="flex space-x-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="approve" id="approve" />
                <Label htmlFor="approve">Approve</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reject" id="reject" />
                <Label htmlFor="reject">Reject</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Rejection Reason - only show when rejected */}
          {approvalDecision === "reject" && (
            <div>
              <Label htmlFor="rejection-reason">
                Rejection Reason
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-1 min-h-[100px]"
              />
            </div>
          )}

          <div>
            <Label htmlFor="acknowledgement-text">
              Additional acknowledgement notes
            </Label>
            <Textarea
              id="acknowledgement-text"
              placeholder="Additional acknowledgement notes..."
              value={getlabAcknowledgement}
              onChange={(e) => setGetlabAcknowledgement(e.target.value)}
              className="mt-1 min-h-[100px]"
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="w-full sm:max-w-2xl flex flex-col h-full">
          <SheetHeader className="flex-shrink-0 border-b border-border pb-5">
            <SheetTitle>GETLAB's Acknowledgement</SheetTitle>
            <SheetDescription>
              Review and provide your acknowledgement for the sample receipt.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-4">{content}</div>
          <div className="border-t border-border pt-4 flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Approval"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left flex-shrink-0 border-b border-border pb-5">
          <DrawerTitle>GETLAB's Acknowledgement</DrawerTitle>
          <DrawerDescription>
            Review and provide your acknowledgement for the sample receipt.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto max-h-[calc(80vh-10rem)]">
          {content}
        </div>
        <DrawerFooter className="pt-2 flex-shrink-0">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Approval"}
          </Button>
          <DrawerClose asChild>
            <Button variant="secondary" disabled={isSubmitting}>
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
