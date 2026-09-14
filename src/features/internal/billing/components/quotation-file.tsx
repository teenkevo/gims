import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Download, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import React from "react";
import { PROJECT_BY_ID_QUERY_RESULT } from "../../../../../sanity.types";
import { useQuotation } from "./useQuotation";
import { useRBAC } from "@/components/rbac-context";
import { Badge } from "@/components/ui/badge";
import {
  RevisionCycleDialog,
  type RevisionCycleEvent,
} from "./revision-cycle-dialog";

type QuotationRevision = NonNullable<
  NonNullable<PROJECT_BY_ID_QUERY_RESULT[number]["quotation"]>["revisions"]
>[number];

function revisionCycleEvents(
  revision:
    | PROJECT_BY_ID_QUERY_RESULT[number]["quotation"]
    | QuotationRevision
    | null
    | undefined,
  options?: { isSuperseded?: boolean; inferRevisedAt?: string | null }
): RevisionCycleEvent[] {
  const stored = (revision?.revisionEvents ?? []).flatMap((event) =>
    event?.type
      ? [
          {
            type: event.type,
            at: event.at,
            notes: event.notes,
            actorName: event.actorName,
            actorType: event.actorType,
          } satisfies RevisionCycleEvent,
        ]
      : []
  );
  if (stored.length > 0) return stored;

  const notes = revision?.rejectionNotes?.trim();
  if (!notes) return [];

  const events: RevisionCycleEvent[] = [
    { type: "revisions_requested", notes },
  ];
  if (options?.isSuperseded) {
    events.push({
      type: "revised",
      at: options.inferRevisedAt,
    });
  }
  return events;
}

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

interface QuotationFileDisplayProps {
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
  events?: RevisionCycleEvent[];
}

const QuotationFileDisplay: React.FC<QuotationFileDisplayProps> = ({
  revisionNumber,
  file,
  isLatest = false,
  events = [],
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
          <div
            className={`${isLatest ? "bg-red-600 dark:bg-red-500" : "bg-gray-600 dark:bg-gray-500"} p-2 rounded mr-4`}
          >
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
        {events.length > 0 && <RevisionCycleDialog events={events} />}
        <FileActions
          fileUrl={fileUrl}
          fileName={fileName || ""}
          mimeType={mimeType || ""}
        />
      </div>
    </div>
  );
};

export default function QuotationFile({
  project,
}: {
  project: PROJECT_BY_ID_QUERY_RESULT[number];
}) {
  const { role } = useRBAC();
  const { quotation, number_parent_revisions, rejected } = useQuotation(
    project,
    role
  );

  return (
    <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg ">
      <CardHeader>
        <CardTitle className="text-xl">Quotation Files</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <div className="flex gap-2">
            <p className="tracking-tight">Current version</p>
            <Badge
              variant="outline"
              className={`text-xs ${
                quotation?.status === "accepted"
                  ? "bg-primary text-primary-foreground"
                  : quotation?.status === "rejected"
                    ? "text-destructive"
                    : quotation?.status === "invoiced"
                      ? "text-primary"
                      : quotation?.status === "fully_paid"
                        ? "text-primary"
                        : quotation?.status === "partially_paid"
                          ? "text-orange-500"
                          : "text-orange-500"
              }`}
            >
              {quotation?.status === "accepted"
                ? "Accepted"
                : quotation?.status === "rejected"
                  ? "Rejected"
                  : quotation?.status === "invoiced"
                    ? "Invoiced"
                    : quotation?.status === "fully_paid"
                      ? "Invoiced & fully paid"
                      : quotation?.status === "partially_paid"
                        ? "Invoiced & Partially paid"
                        : "Pending"}
            </Badge>
          </div>
          {quotation && (
            <QuotationFileDisplay
              revisionNumber={quotation.revisionNumber || ""}
              file={quotation.file}
              isLatest={true}
              events={revisionCycleEvents(quotation)}
            />
          )}

          {number_parent_revisions > 0 && (
            <p className="mb-6 mt-10 text-sm text-muted-foreground">
              Previous versions
            </p>
          )}
          {number_parent_revisions > 0 &&
            rejected?.map(
              (revision, index) =>
                revision?._id && (
                  <QuotationFileDisplay
                    key={revision._id}
                    revisionNumber={revision.revisionNumber || ""}
                    file={revision.file}
                    events={revisionCycleEvents(revision, {
                      isSuperseded: true,
                      inferRevisedAt:
                        index === 0
                          ? quotation?.quotationDate
                          : rejected[index - 1]?.quotationDate,
                    })}
                  />
                )
            )}
        </div>
      </CardContent>
    </div>
  );
}
