"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import type { PROJECT_BY_ID_QUERY_RESULT } from "../../../../../sanity.types";
import { ReportRevisionNotesDialog } from "./report-revision-notes-dialog";
import { useRBAC } from "@/components/rbac-context";

type ProjectReport = NonNullable<
  PROJECT_BY_ID_QUERY_RESULT[number]["report"]
>;

function FileActions({
  fileUrl,
  fileName,
}: {
  fileUrl: string;
  fileName: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link className="flex items-center" href={fileUrl} target="_blank">
          <ExternalLink className="h-4 w-4 mr-2" />
          View
        </Link>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <Link className="flex items-center" href={`${fileUrl}?dl=${fileName}`}>
          <Download className="h-4 w-4 mr-2 text-primary" />
          Download
        </Link>
      </Button>
    </div>
  );
}

function ReportFileDisplay({
  revisionNumber,
  title,
  file,
  isLatest = false,
  notes,
}: {
  revisionNumber: string;
  title?: string | null;
  file: ProjectReport["file"];
  isLatest?: boolean;
  notes?: string | null;
}) {
  const fileUrl = file?.asset?.url || "";
  const fileName = file?.asset?.originalFilename || "report.pdf";
  const fileSize = ((file?.asset?.size || 0) / (1024 * 1024)).toFixed(2);

  if (!fileUrl) return null;

  return (
    <div
      className={`flex flex-wrap justify-between items-center ${isLatest ? "dark:bg-muted/50 bg-muted" : "dark:bg-muted/20 bg-muted border border-destructive/50"} shadow-md p-4 rounded-lg gap-4`}
    >
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {revisionNumber}
          </Badge>
          {notes && <ReportRevisionNotesDialog notes={notes} />}
        </div>
        <div className="flex items-start md:items-center my-4">
          <div className="bg-red-500 p-2 rounded mr-4">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <Link
              className="hover:underline underline-offset-2 transition-all font-medium"
              href={fileUrl}
              target="_blank"
            >
              {title || fileName}
            </Link>
            <p className="text-xs text-muted-foreground mt-1">
              {fileName} · {fileSize} MB
            </p>
          </div>
        </div>
      </div>
      <FileActions fileUrl={fileUrl} fileName={fileName} />
    </div>
  );
}

export default function ReportFile({
  project,
}: {
  project: PROJECT_BY_ID_QUERY_RESULT[number];
}) {
  const { isClientUser } = useRBAC();
  const report = project.report;
  if (!report?.file?.asset?.url) return null;

  // Clients only see the report file once QA has accepted and sent it
  if (isClientUser && report.status !== "sent_to_client") {
    return null;
  }

  const revisions = report.revisions || [];

  return (
    <div className="rounded-lg border bg-gradient-to-b from-muted/20 to-muted/40">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Report Files</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ReportFileDisplay
          revisionNumber={report.revisionNumber || "Current"}
          title={report.title}
          file={report.file}
          isLatest
          notes={
            !isClientUser &&
            (report.status === "revisions_requested" ||
              report.status === "rejected")
              ? report.qaReview?.notes
              : null
          }
        />
        {!isClientUser &&
          revisions.map((revision) => (
            <ReportFileDisplay
              key={revision._id}
              revisionNumber={revision.revisionNumber || "Previous"}
              title={revision.title}
              file={revision.file}
              notes={revision.qaReview?.notes}
            />
          ))}
      </CardContent>
    </div>
  );
}
