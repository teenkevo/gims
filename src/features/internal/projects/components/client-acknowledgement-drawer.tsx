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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { PROJECT_BY_ID_QUERYResult } from "../../../../../sanity.types";

interface ClientAcknowledgementDrawerProps {
  children: React.ReactNode;
  project: PROJECT_BY_ID_QUERYResult[number];
  existingSampleReceipt?: PROJECT_BY_ID_QUERYResult[number]["sampleReceipt"];
  onAcknowledgementSubmit: (data: ClientAcknowledgementData) => Promise<void>;
}

export interface ClientAcknowledgementData {
  acknowledgementText: string;
  clientSignature: string;
  clientRepresentative: string;
}

export function ClientAcknowledgementDrawer({
  children,
  project,
  existingSampleReceipt,
  onAcknowledgementSubmit,
}: ClientAcknowledgementDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Initialize state from existing data if available
  const [acknowledgementText, setAcknowledgementText] = React.useState<string>(
    existingSampleReceipt?.clientAcknowledgement?.acknowledgementText ||
      "I/We agree that GETLAB carries out the above tests and issue test report/certificate and I/We further agree to the applicable terms and conditions stated overleaf"
  );
  const [clientSignature, setClientSignature] = React.useState<string>(
    existingSampleReceipt?.clientAcknowledgement?.clientSignature || ""
  );
  const [clientRepresentative, setClientRepresentative] =
    React.useState<string>(
      existingSampleReceipt?.clientAcknowledgement?.clientRepresentative || ""
    );

  // Update state when existingSampleReceipt changes
  React.useEffect(() => {
    if (existingSampleReceipt?.clientAcknowledgement?.acknowledgementText) {
      setAcknowledgementText(
        existingSampleReceipt.clientAcknowledgement.acknowledgementText
      );
    }
    if (existingSampleReceipt?.clientAcknowledgement?.clientSignature) {
      setClientSignature(
        existingSampleReceipt.clientAcknowledgement.clientSignature
      );
    }
    if (existingSampleReceipt?.clientAcknowledgement?.clientRepresentative) {
      setClientRepresentative(
        existingSampleReceipt.clientAcknowledgement.clientRepresentative
      );
    }
  }, [existingSampleReceipt]);

  const handleSubmit = async () => {
    // Validation
    if (!acknowledgementText?.trim()) {
      toast.error("Acknowledgement text is required");
      return;
    }

    if (!clientSignature?.trim()) {
      toast.error("Client signature is required");
      return;
    }

    if (!clientRepresentative) {
      toast.error("Please select client representative type");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAcknowledgementSubmit({
        acknowledgementText,
        clientSignature,
        clientRepresentative,
      });
      setOpen(false);
      toast.success("Sample receipt acknowledged successfully!");
    } catch (error) {
      console.error("Failed to submit acknowledgement:", error);
      toast.error("Failed to submit acknowledgement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <div className="space-y-6 p-1">
      <div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="acknowledgement-text">
              Acknowledgement Text
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              disabled={true}
              id="acknowledgement-text"
              placeholder="I/We agree that GETLAB carries out the above tests and issue test report/certificate and I/We further agree to the applicable terms and conditions stated overleaf"
              value={acknowledgementText}
              onChange={(e) => setAcknowledgementText(e.target.value)}
              className="mt-1 min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="client-signature">
              Signature of Customer
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="client-signature"
              type="text"
              placeholder="Enter name as signature"
              className="mt-1"
              value={clientSignature}
              onChange={(e) => setClientSignature(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="client-representative">
              Client Representative Type
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <RadioGroup
              value={clientRepresentative}
              onValueChange={(value) => setClientRepresentative(value)}
              className="flex space-x-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="client-rep" id="client-rep" />
                <Label htmlFor="client-rep">Client's Rep.</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="contractor-rep" id="contractor-rep" />
                <Label htmlFor="contractor-rep">Contractor's Rep.</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="consultant-rep" id="consultant-rep" />
                <Label htmlFor="consultant-rep">Consultant's Rep.</Label>
              </div>
            </RadioGroup>
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
            <SheetTitle>Client Acknowledgement</SheetTitle>
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
              {isSubmitting ? "Submitting..." : "Submit Acknowledgement"}
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
          <DrawerTitle>Client Acknowledgement</DrawerTitle>
          <DrawerDescription>
            Review and provide your acknowledgement for the sample receipt.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto max-h-[calc(80vh-10rem)]">
          {content}
        </div>
        <DrawerFooter className="pt-2 flex-shrink-0">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Acknowledgement"}
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
