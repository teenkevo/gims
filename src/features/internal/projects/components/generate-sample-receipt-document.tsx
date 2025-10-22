import { Document, pdf } from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import { FileText, Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SampleReceiptDocument } from "./sample-receipt-document";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";
import React, { Dispatch, SetStateAction, useMemo } from "react";
import Loading from "@/app/loading";
import { toast } from "sonner";
import { ButtonLoading } from "@/components/button-loading";
import { createSampleReceipt } from "@/lib/actions";
import {
  ALL_PERSONNEL_QUERYResult,
  PROJECT_BY_ID_QUERYResult,
} from "../../../../../sanity.types";

interface ReviewItem {
  id: number;
  label: string;
  status: string;
  comments: string;
}

interface AdequacyCheck {
  id: number;
  label: string;
  required: boolean;
  status: string;
  comments: string;
}

interface SampleReceiptData {
  sampleReviewTemplate: string;
  sampleAdequacyTemplate: string;
  reviewItems: ReviewItem[];
  adequacyChecks: AdequacyCheck[];
  overallStatus: string;
  comments: string;
  clientAcknowledgement: string;
  clientSignature: string;
  clientRepresentative: string;
  getlabAcknowledgement: string;
  expectedDeliveryDate: string;
  sampleRetentionDuration: string;
  sampleReceiptRole: string;
  sampleReceiptName: string;
  sampleReceiptSignature: string;
  projectName?: string;
  clientName?: string;
  email?: string;
  sampleReceiptNumber?: string;
  personnel?: ALL_PERSONNEL_QUERYResult[number];
}

interface GenerateSampleReceiptDocumentProps {
  project: PROJECT_BY_ID_QUERYResult[number];
  sampleReceiptData: SampleReceiptData;
}

export const GenerateSampleReceiptDocument = ({
  project,
  sampleReceiptData,
}: GenerateSampleReceiptDocumentProps) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Validation function
  const validateSampleReceiptData = () => {
    const { reviewItems, adequacyChecks, overallStatus } = sampleReceiptData;

    // Check if all review items have a status
    const incompleteReviewItems = reviewItems.filter(
      (item) => !item.status || item.status === ""
    );

    if (incompleteReviewItems.length > 0) {
      toast.warning("Please complete all general checks before reviewing");
      return false;
    }

    // Check if all adequacy checks have a status
    const incompleteAdequacy = adequacyChecks.filter(
      (item) => !item.status || item.status === ""
    );

    if (incompleteAdequacy.length > 0) {
      toast.warning("Please complete all adequacy checks before reviewing");
      return false;
    }

    // Check overall status
    if (!overallStatus) {
      toast.warning("Please select an overall status before reviewing");
      return false;
    }

    // Check for "no" responses without comments
    const invalidItems = reviewItems.filter(
      (item) =>
        item.status === "no" && (!item.comments || item.comments.trim() === "")
    );

    if (invalidItems.length > 0) {
      toast.warning("Please provide comments for all items marked as 'No'");
      return false;
    }

    // Check for "inadequate" adequacy checks without comments
    const invalidAdequacyItems = adequacyChecks.filter(
      (item) =>
        item.status === "inadequate" &&
        (!item.comments || item.comments.trim() === "")
    );

    if (invalidAdequacyItems.length > 0) {
      toast.warning(
        "Please provide comments for all items marked as 'Inadequate'"
      );
      return false;
    }

    // Additional validation for required fields
    // Client acknowledgement fields are not required for sample receipt generation

    if (
      !sampleReceiptData.sampleReceiptRole ||
      sampleReceiptData.sampleReceiptRole.trim() === ""
    ) {
      toast.warning(
        "Please select sample receipt personnel role before reviewing"
      );
      return false;
    }

    if (
      !sampleReceiptData.sampleReceiptName ||
      sampleReceiptData.sampleReceiptName.trim() === ""
    ) {
      toast.warning(
        "Please provide sample receipt personnel name before reviewing"
      );
      return false;
    }

    if (
      !sampleReceiptData.sampleReceiptSignature ||
      sampleReceiptData.sampleReceiptSignature.trim() === ""
    ) {
      toast.warning(
        "Please provide sample receipt personnel signature before reviewing"
      );
      return false;
    }

    return true;
  };

  const handleOpenReview = () => {
    // Allow opening without validation toasts
    setOpen(true);
  };

  // Check if form is complete for visual indication
  const isFormComplete = () => {
    const { reviewItems, adequacyChecks, overallStatus } = sampleReceiptData;

    const incompleteReviewItems = reviewItems.filter(
      (item) => !item.status || item.status === ""
    );

    const incompleteAdequacy = adequacyChecks.filter(
      (item) => !item.status || item.status === ""
    );

    const invalidItems = reviewItems.filter(
      (item) =>
        item.status === "no" && (!item.comments || item.comments.trim() === "")
    );

    const invalidAdequacyItems = adequacyChecks.filter(
      (item) =>
        item.status === "inadequate" &&
        (!item.comments || item.comments.trim() === "")
    );

    return (
      incompleteReviewItems.length === 0 &&
      incompleteAdequacy.length === 0 &&
      overallStatus &&
      invalidItems.length === 0 &&
      invalidAdequacyItems.length === 0 &&
      // Client acknowledgement fields are not required for form completion
      sampleReceiptData.sampleReceiptRole?.trim() &&
      sampleReceiptData.sampleReceiptName?.trim() &&
      sampleReceiptData.sampleReceiptSignature?.trim()
    );
  };

  const Doc = useMemo(
    () => (
      <Document>
        <SampleReceiptDocument {...sampleReceiptData} />
      </Document>
    ),
    [sampleReceiptData]
  );

  const handleDownloadPDF = async () => {
    // Validate form before allowing download
    if (!validateSampleReceiptData()) {
      return;
    }

    setIsLoading(true);
    try {
      const blob = await pdf(Doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Sample-Receipt-Verification-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to generate PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSampleReceipt = async () => {
    // Validate form before allowing creation
    if (!validateSampleReceiptData()) {
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();

      // Add project ID
      formData.append("projectId", project._id);

      // Add verification date (current date)
      formData.append("verificationDate", new Date().toISOString());

      // Add review items
      formData.append(
        "reviewItems",
        JSON.stringify(sampleReceiptData.reviewItems)
      );

      // Add adequacy checks
      formData.append(
        "adequacyChecks",
        JSON.stringify(sampleReceiptData.adequacyChecks)
      );

      // Add overall status and comments
      formData.append("overallStatus", sampleReceiptData.overallStatus);
      formData.append("overallComments", sampleReceiptData.comments || "");

      // Add client acknowledgement
      formData.append(
        "clientAcknowledgement",
        JSON.stringify({
          acknowledgementText: sampleReceiptData.clientAcknowledgement || "",
          clientSignature: sampleReceiptData.clientSignature || "",
          clientRepresentative: sampleReceiptData.clientRepresentative || "",
        })
      );

      // Add GETLAB acknowledgement
      formData.append(
        "getlabAcknowledgement",
        JSON.stringify({
          expectedDeliveryDate: sampleReceiptData.expectedDeliveryDate || "",
          requiresMoreSamples: false, // Default value
          sampleRetentionDuration:
            sampleReceiptData.sampleRetentionDuration || "",
          acknowledgementText: sampleReceiptData.getlabAcknowledgement || "",
        })
      );

      // Add sample receipt personnel
      formData.append(
        "sampleReceiptPersonnel",
        JSON.stringify({
          role: sampleReceiptData.sampleReceiptRole,
          name: sampleReceiptData.sampleReceiptName,
          signature: sampleReceiptData.sampleReceiptSignature,
          personnel: sampleReceiptData.personnel?._id, // No personnel reference for now
        })
      );

      // Add submission info (using current user - you may need to get this from context)
      formData.append("submittedBy", "current-user-id"); // TODO: Get actual user ID
      formData.append("submittedAt", new Date().toISOString());

      // Add template references (optional for now)
      formData.append("reviewTemplate", sampleReceiptData.sampleReviewTemplate);
      formData.append(
        "adequacyTemplate",
        sampleReceiptData.sampleAdequacyTemplate
      );

      const result = await createSampleReceipt({}, formData);

      if (result.status === "ok") {
        toast.success("Sample receipt created successfully!");
        setOpen(false); // Close the sheet
      } else {
        toast.error(result.error || "Failed to create sample receipt");
      }
    } catch (error) {
      console.error("Error creating sample receipt:", error);
      toast.error("Failed to create sample receipt");
    } finally {
      setIsLoading(false);
    }
  };

  const PDFViewer = dynamic(() => import("@/components/pdf-viewer"), {
    loading: () => <Loading />,
    ssr: false,
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="sm"
          className="fixed right-0 top-[95%] -translate-y-1/2 rounded-l-full rounded-r-none border-r-0 px-3 transition-transform hover:translate-x-1 focus:translate-x-1"
          onClick={handleOpenReview}
        >
          <FileText className="mr-2" strokeWidth={1} />
          Review Sample Receipt
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className={
          isMobile ? "h-[80vh] rounded-t-2xl p-4" : "h-full rounded-l-2xl"
        }
      >
        <SheetHeader className="text-start">
          <SheetTitle className="flex items-center gap-2 text-lg md:text-2xl">
            Sample Receipt Verification <Badge variant="outline">Review</Badge>
          </SheetTitle>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <ButtonLoading />
            ) : (
              <>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateSampleReceipt}
                  disabled={!isFormComplete()}
                  className={
                    !isFormComplete() ? "opacity-50 cursor-not-allowed" : ""
                  }
                >
                  <Save className="mr-2 h-4 w-4" />
                  Create Sample Receipt
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleDownloadPDF}
                  disabled={!isFormComplete()}
                  className={
                    !isFormComplete() ? "opacity-50 cursor-not-allowed" : ""
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </>
            )}
            {!isFormComplete() && (
              <Badge variant="outline" className="text-xs text-orange-500">
                Complete form to enable actions
              </Badge>
            )}
          </div>
        </SheetHeader>
        {!isLoading ? (
          <div className="mt-6 space-y-4">
            <PDFViewer width="100%" height={600}>
              {Doc}
            </PDFViewer>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <Loading text="Generating Sample Receipt..." />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
