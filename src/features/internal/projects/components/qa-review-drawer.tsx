"use client";

import * as React from "react";
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
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ButtonLoading } from "@/components/button-loading";
import { toast } from "sonner";
import { reviewReport } from "@/lib/report-actions";
import type { PROJECT_BY_ID_QUERY_RESULT } from "../../../../../sanity.types";

type Decision = "accept" | "reject" | "revisions_requested";

function QaReviewForm({
  project,
  reportId,
  onSuccess,
  onCancel,
}: {
  project: PROJECT_BY_ID_QUERY_RESULT[number];
  reportId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [decision, setDecision] = React.useState<Decision>("accept");
  const [notes, setNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      (decision === "reject" || decision === "revisions_requested") &&
      !notes.trim()
    ) {
      toast.error("Please provide notes for this decision");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("reportId", reportId);
      formData.append("projectId", project._id);
      formData.append("decision", decision);
      formData.append("notes", notes);

      const result = await reviewReport({}, formData);
      if (result.status === "ok") {
        toast.success(
          decision === "accept"
            ? "Report accepted and sent to client"
            : decision === "reject"
              ? "Report rejected"
              : "Revisions requested"
        );
        onSuccess();
      } else {
        toast.error(result.error || "Failed to submit QA review");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit QA review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <Label>Decision</Label>
        <RadioGroup
          value={decision}
          onValueChange={(value) => setDecision(value as Decision)}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="accept" id="accept" />
            <Label htmlFor="accept" className="font-normal">
              Accept — send report to client
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="revisions_requested" id="revisions" />
            <Label htmlFor="revisions" className="font-normal">
              Request revisions
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="reject" id="reject" />
            <Label htmlFor="reject" className="font-normal">
              Reject
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="qa-notes">
          Notes
          {decision !== "accept" ? " (required)" : " (optional)"}
        </Label>
        <Textarea
          id="qa-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={
            decision === "accept"
              ? "Optional acceptance notes"
              : "Explain what needs to change or why this was rejected"
          }
          rows={4}
          required={decision !== "accept"}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {isSubmitting ? (
          <ButtonLoading />
        ) : (
          <Button type="submit">Submit review</Button>
        )}
      </div>
    </form>
  );
}

export function QaReviewDrawer({
  project,
  reportId,
  children,
}: {
  project: PROJECT_BY_ID_QUERY_RESULT[number];
  reportId: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const form = (
    <QaReviewForm
      project={project}
      reportId={reportId}
      onSuccess={() => {
        setOpen(false);
        window.location.reload();
      }}
      onCancel={() => setOpen(false)}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QA review</DialogTitle>
            <DialogDescription>
              Accept the report, reject it, or request revisions from the lab.
            </DialogDescription>
          </DialogHeader>
          {form}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>QA review</DrawerTitle>
          <DrawerDescription>
            Accept the report, reject it, or request revisions from the lab.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-6">{form}</div>
      </DrawerContent>
    </Drawer>
  );
}
