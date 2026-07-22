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
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/file-upload";
import { ButtonLoading } from "@/components/button-loading";
import { toast } from "sonner";
import {
  createReport,
  createReportRevision,
  updateReport,
} from "@/lib/report-actions";
import type {
  ALL_PERSONNEL_QUERY_RESULT,
  PROJECT_BY_ID_QUERY_RESULT,
} from "../../../../../sanity.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRBAC } from "@/components/rbac-context";

type ProjectReport = NonNullable<PROJECT_BY_ID_QUERY_RESULT[number]["report"]>;

async function uploadReportFile(file: File) {
  const formData = new FormData();
  formData.append("files", file);
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  const result = await response.json();
  if (!result.files?.[0]?.fileId) {
    throw new Error("Failed to upload report file");
  }
  return result.files[0].fileId as string;
}

function CreateReportForm({
  project,
  personnel,
  existingReport,
  isRevision = false,
  onSuccess,
  onCancel,
}: {
  project: PROJECT_BY_ID_QUERY_RESULT[number];
  personnel: ALL_PERSONNEL_QUERY_RESULT;
  existingReport?: ProjectReport | null;
  isRevision?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { user } = useRBAC();
  const [title, setTitle] = React.useState(existingReport?.title || "");
  const [summary, setSummary] = React.useState(existingReport?.summary || "");
  const [files, setFiles] = React.useState<File[]>([]);
  const [selectedPersonnelId, setSelectedPersonnelId] = React.useState(
    existingReport?.preparedBy?.personnel?._id || ""
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitForQa, setSubmitForQa] = React.useState(isRevision);

  const selectedPersonnel = personnel.find((p) => p._id === selectedPersonnelId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Report title is required");
      return;
    }

    const needsNewFile = !existingReport || isRevision || files.length > 0;
    if (needsNewFile && files.length === 0) {
      toast.error("Please upload a report PDF");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("projectId", project._id);
      formData.append("title", title.trim());
      formData.append("summary", summary);
      formData.append(
        "preparedBy",
        JSON.stringify({
          personnel: selectedPersonnelId || undefined,
          name:
            selectedPersonnel?.fullName ||
            existingReport?.preparedBy?.name ||
            user?.fullName ||
            "",
          role: existingReport?.preparedBy?.role || "",
        })
      );

      let result;

      if (isRevision && existingReport) {
        const fileId = await uploadReportFile(files[0]);
        formData.append("originalReportId", existingReport._id);
        formData.append("submitForQa", submitForQa ? "true" : "false");
        result = await createReportRevision({}, formData, fileId);
      } else if (existingReport) {
        formData.append("reportId", existingReport._id);
        const fileId =
          files.length > 0 ? await uploadReportFile(files[0]) : undefined;
        result = await updateReport({}, formData, fileId);
      } else {
        const fileId = await uploadReportFile(files[0]);
        result = await createReport({}, formData, fileId);
      }

      if (result.status === "ok") {
        toast.success(
          isRevision
            ? "Report revision created"
            : existingReport
              ? "Report updated"
              : "Report created"
        );
        onSuccess();
      } else {
        toast.error(result.error || "Failed to save report");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="report-title">Report title</Label>
        <Input
          id="report-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Geotechnical Investigation Report"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="report-summary">Summary / notes</Label>
        <Textarea
          id="report-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Optional notes about this report"
          rows={3}
        />
      </div>

      {personnel.length > 0 && (
        <div className="space-y-2">
          <Label>Prepared by</Label>
          <Select
            value={selectedPersonnelId}
            onValueChange={setSelectedPersonnelId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select personnel" />
            </SelectTrigger>
            <SelectContent>
              {personnel.map((person) => (
                <SelectItem key={person._id} value={person._id}>
                  {person.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>
          Report PDF
          {existingReport && !isRevision ? " (optional to replace)" : ""}
        </Label>
        <FileUpload
          multiple={false}
          accept="application/pdf"
          maxSize={25}
          onFilesChange={setFiles}
        />
        {existingReport?.file?.asset?.originalFilename && files.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Current file: {existingReport.file.asset.originalFilename}
          </p>
        )}
      </div>

      {isRevision && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={submitForQa}
            onChange={(e) => setSubmitForQa(e.target.checked)}
            className="rounded border"
          />
          Submit revision for QA review immediately
        </label>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {isSubmitting ? (
          <ButtonLoading />
        ) : (
          <Button type="submit">
            {isRevision
              ? "Save revision"
              : existingReport
                ? "Update report"
                : "Submit report"}
          </Button>
        )}
      </div>
    </form>
  );
}

export function CreateReportDrawer({
  project,
  personnel = [],
  existingReport,
  isRevision = false,
  children,
}: {
  project: PROJECT_BY_ID_QUERY_RESULT[number];
  personnel?: ALL_PERSONNEL_QUERY_RESULT;
  existingReport?: ProjectReport | null;
  isRevision?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const title = isRevision
    ? "Revise report"
    : existingReport
      ? "Edit report"
      : "Submit report";
  const description = isRevision
    ? "Upload a revised report addressing QA feedback."
    : "Upload the project test report for internal QA review.";

  const form = (
    <CreateReportForm
      project={project}
      personnel={personnel}
      existingReport={existingReport}
      isRevision={isRevision}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
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
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-6">{form}</div>
        <DrawerFooter />
      </DrawerContent>
    </Drawer>
  );
}
