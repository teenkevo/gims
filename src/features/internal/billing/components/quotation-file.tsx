import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Download, ExternalLink, FileText, Trash } from "lucide-react";
import Link from "next/link";
import React from "react";
import mime from "mime-types";
import { PROJECT_BY_ID_QUERYResult } from "../../../../../sanity.types";
import { useQuotation } from "./useQuotation";
import { useRBAC } from "@/components/rbac-context";
import { Badge } from "@/components/ui/badge";

export default function QuotationFile({
  project,
}: {
  project: PROJECT_BY_ID_QUERYResult[number];
}) {
  const { role } = useRBAC();
  const { quotation, parent_revisions } = useQuotation(project, role);

  const all_revisions = [...parent_revisions];
  // remove latest version
  all_revisions.shift();

  return (
    <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg ">
      <CardHeader>
        <CardTitle className="text-xl">Quotation Files</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <div className="flex gap-2">
            <p className="tracking-tight">Final revision</p>
            <Badge
              variant="outline"
              className={`text-xs ${
                quotation?.status === "accepted"
                  ? "bg-primary text-primary-foreground"
                  : quotation?.status === "rejected"
                    ? "bg-destructive text-destructive-foreground"
                    : quotation?.status === "invoiced"
                      ? "bg-primary text-primary-foreground"
                      : "bg-orange-500 text-orange-foreground"
              }`}
            >
              {quotation?.status === "accepted"
                ? "Accepted"
                : quotation?.status === "rejected"
                  ? "Rejected"
                  : quotation?.status === "invoiced"
                    ? "Invoiced"
                    : "Pending"}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center justify-between dark:bg-muted/50 bg-muted shadow-md p-4 rounded-lg gap-4">
            <div className="flex items-center">
              <div className="bg-red-600 dark:bg-red-500 p-2 item-start rounded mr-4">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <Link
                className="hover:underline underline-offset-2 transition-all"
                href={quotation?.file?.asset?.url || ""}
                target="_blank"
              >
                <p className="font-medium text-sm">
                  {quotation?.file?.asset?.originalFilename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {quotation?.file?.asset?.mimeType?.toUpperCase()} •{" "}
                  {(
                    (quotation?.file?.asset?.size || 0) /
                    (1024 * 1024)
                  ).toFixed(2) + " MB"}
                </p>
                <Badge variant="outline" className="my-2 text-xs">
                  {quotation?.revisionNumber}
                </Badge>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Link
                  className="flex items-center"
                  href={quotation?.file?.asset?.url || ""}
                  target="_blank"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <Link
                  className="flex items-center"
                  href={`${quotation?.file?.asset?.url || ""}?dl=${quotation?.file?.asset?.originalFilename}.${mime.extension(quotation?.file?.asset?.mimeType || "")}`}
                >
                  <Download className="h-4 w-4 mr-2 text-primary" />
                  Download
                </Link>
              </Button>
            </div>
          </div>

          <p className=" mb-6">{parent_revisions.length} revisions</p>
          {/* ALL minus latest version */}
          {all_revisions?.map((revision) => (
            <div
              key={revision?._id}
              className="flex flex-wrap items-center justify-between dark:bg-muted/50 bg-muted shadow-md p-4 rounded-lg gap-4"
            >
              <div className="flex items-center">
                <div className="bg-gray-600 dark:bg-gray-500 p-2 rounded mr-4">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <Link
                  className="hover:underline underline-offset-2 transition-all"
                  href={revision?.file?.asset?.url || ""}
                  target="_blank"
                >
                  <p className="font-medium">
                    {revision?.file?.asset?.originalFilename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {revision?.file?.asset?.mimeType?.toUpperCase()} •{" "}
                    {(
                      (revision?.file?.asset?.size || 0) /
                      (1024 * 1024)
                    ).toFixed(2) + " MB"}
                  </p>
                  <Badge variant="outline" className="my-2 text-xs">
                    {revision?.revisionNumber}
                  </Badge>
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Link
                    className="flex items-center"
                    href={revision?.file?.asset?.url || ""}
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <Link
                    className="flex items-center"
                    href={`${revision?.file?.asset?.url || ""}?dl=${revision?.file?.asset?.originalFilename}.${mime.extension(revision?.file?.asset?.mimeType || "")}`}
                  >
                    <Download className="h-4 w-4 mr-2 text-primary" />
                    Download
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </div>
  );
}
