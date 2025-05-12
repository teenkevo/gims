import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Download, ExternalLink, FileText, Trash } from "lucide-react";
import Link from "next/link";
import React from "react";
import mime from "mime-types";
import { PROJECT_BY_ID_QUERYResult } from "../../../../../sanity.types";

interface QuotationFileProps {
  quotation: PROJECT_BY_ID_QUERYResult[number]["quotation"];
}

export default function QuotationFile({ quotation }: QuotationFileProps) {
  return (
    <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg ">
      <CardHeader>
        <CardTitle className="text-xl">Quotation</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">
          Access and download the quotation related to this project.
        </p>
        <div className="space-y-4 mb-4">
          <div className="flex flex-wrap items-center justify-between bg-muted/50 p-4 rounded-lg gap-4">
            <div className="flex items-center">
              <div className="bg-red-600 dark:bg-red-500 p-2 rounded mr-4">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <Link
                className="hover:underline underline-offset-2 transition-all"
                href={quotation?.file?.asset?.url || ""}
                target="_blank"
              >
                <p className="font-medium">
                  {quotation?.file?.asset?.originalFilename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {quotation?.file?.asset?.mimeType?.toUpperCase()} •{" "}
                  {(
                    (quotation?.file?.asset?.size || 0) /
                    (1024 * 1024)
                  ).toFixed(2) + " MB"}
                </p>
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
              <Button
                size="icon"
                variant="ghost"
                // onClick={async () => {
                //   const docs = await getTestMethodsReferencingFile(
                //     doc.asset?._id || ""
                //   );
                //   setReferencingDocs(docs);
                //   setOpenDeleteFileDialog(true);
                // }}
              >
                <Trash className="h-4 w-4 text-destructive" />
              </Button>
              {/* <DeleteFile
                        id={quotation?.file?.asset?._id || ""}
                        open={openDeleteFileDialog}
                        onClose={() => setOpenDeleteFileDialog(false)}
                        referencingDocs={referencingDocs}
                        currentTestMethodId={testMethod._id}
                        fileKey={quotation?.file?._key}
                      /> */}
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
