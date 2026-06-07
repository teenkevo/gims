import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Download, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import React from "react";
import { PROJECT_BY_ID_QUERYResult } from "../../../../../sanity.types";
import { useRBAC } from "@/components/rbac-context";
import { Badge } from "@/components/ui/badge";
import { SampleReceiptRevisionNotesDialog } from "./sample-receipt-revision-notes-dialog";

interface FileActionsProps {
  fileUrl: string;
  fileName: string;
  mimeType: string;
}

const FileActions: React.FC<FileActionsProps> = ({
  fileUrl,
  fileName,
  mimeType,
}) => (
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm">
      <Link className="flex items-center" href={fileUrl} target="_blank">
        <ExternalLink className="h-4 w-4 mr-2" />
        View
      </Link>
    </Button>
    <Button variant="outline" size="sm">
      <Link className="flex items-center" href={`${fileUrl}?dl=${fileName}`}>
        <Download className="h-4 w-4 mr-2 text-primary" />
        Download
      </Link>
    </Button>
  </div>
);

interface SampleReceiptFileDisplayProps {
  revisionNumber: string;
  file: {
    asset?: {
      _id: string;
      url: string | null;
      originalFilename: string | null;
      mimeType: string | null;
      size: number | null;
    } | null;
  } | null;
  isLatest?: boolean;
  rejectionNotes?: string;
}

const SampleReceiptFileDisplay: React.FC<SampleReceiptFileDisplayProps> = ({
  revisionNumber,
  file,
  isLatest = false,
  rejectionNotes,
}) => {
  const fileUrl = file?.asset?.url || "";
  const fileName = file?.asset?.originalFilename;
  const mimeType = file?.asset?.mimeType;
  const fileSize = ((file?.asset?.size || 0) / (1024 * 1024)).toFixed(2);

  return (
    <div
      className={`flex flex-wrap justify-between items-center ${isLatest ? "dark:bg-muted/50 bg-muted" : "dark:bg-muted/20 bg-muted border border-destructive/50"} shadow-md p-4 rounded-lg gap-4`}
    >
      <div>
        <Badge variant="secondary" className="text-xs">
          {revisionNumber}
        </Badge>
        <div className="flex items-start md:items-center my-4">
          <div className={`bg-red-500 p-2 rounded mr-4`}>
            <FileText className="h-6 w-6 text-white" />
          </div>
          <Link
            className="hover:underline underline-offset-2 transition-all"
            href={fileUrl}
            target="_blank"
          >
            <p className="font-medium text-sm">{fileName}</p>
            <p className="text-xs text-muted-foreground">
              {mimeType} • {fileSize} MB
            </p>
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {rejectionNotes && (
          <SampleReceiptRevisionNotesDialog revisionText={rejectionNotes} />
        )}
        <FileActions
          fileUrl={fileUrl}
          fileName={fileName || ""}
          mimeType={mimeType || ""}
        />
      </div>
    </div>
  );
};

export default function SampleReceiptFile({
  project,
}: {
  project: PROJECT_BY_ID_QUERYResult[number];
}) {
  const { role } = useRBAC();
  const sampleReceipt = project.sampleReceipt;

  // Get parent revisions if they exist
  const revisions = sampleReceipt?.revisions || [];
  const rejectedRevisions = revisions.filter((rev) => {
    if (typeof rev === "object" && rev !== null && "_id" in rev) {
      return (
        rev.status === "rejected" &&
        rev.getlabAcknowledgement?.rejectionReason &&
        rev.getlabAcknowledgement?.rejectionReason?.trim() !== ""
      );
    }
    return false;
  }) as PROJECT_BY_ID_QUERYResult[number]["sampleReceipt"][];

  return (
    <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl">Sample Receipt Files</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <div className="flex gap-2">
            <p className="tracking-tight">Current Version</p>
            <Badge
              variant="outline"
              className={`text-xs ${
                sampleReceipt?.status === "client_acknowledged"
                  ? "bg-primary text-primary-foreground"
                  : sampleReceipt?.status === "rejected"
                    ? "text-destructive"
                    : sampleReceipt?.status === "sent_to_client"
                      ? "text-orange-500"
                      : sampleReceipt?.status === "approved"
                        ? "text-green-600"
                        : "text-muted-foreground"
              }`}
            >
              {sampleReceipt?.status === "client_acknowledged"
                ? "Acknowledged"
                : sampleReceipt?.status === "rejected"
                  ? "Rejected"
                  : sampleReceipt?.status === "sent_to_client"
                    ? "Sent to Client"
                    : sampleReceipt?.status === "approved"
                      ? "Approved"
                      : "Pending"}
            </Badge>
          </div>
          {sampleReceipt && (
            <SampleReceiptFileDisplay
              revisionNumber={sampleReceipt.revisionNumber || ""}
              file={sampleReceipt.file}
              isLatest={true}
            />
          )}

          {rejectedRevisions.length > 0 && (
            <p className="mb-6 mt-10 text-sm text-destructive">
              Rejected Versions
            </p>
          )}
          {rejectedRevisions.length > 0 &&
            rejectedRevisions.map(
              (revision) =>
                revision?.file && (
                  <SampleReceiptFileDisplay
                    key={revision?._id}
                    revisionNumber={revision?.revisionNumber || ""}
                    file={revision?.file}
                    rejectionNotes={
                      revision?.getlabAcknowledgement?.rejectionReason || ""
                    }
                  />
                )
            )}
        </div>
      </CardContent>
    </div>
  );
}
