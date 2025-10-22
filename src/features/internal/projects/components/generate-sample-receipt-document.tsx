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
import {
  createSampleReceipt,
  updateSampleReceipt,
  approveSampleReceipt,
} from "@/lib/actions";
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
  approvalDecision?: string;
  rejectionReason?: string;
  expectedDeliveryDate: string;
  sampleRetentionDuration: string;
  sampleReceiptName: string;
  projectName?: string;
  clientName?: string;
  email?: string;
  sampleReceiptNumber?: string;
  personnel?: ALL_PERSONNEL_QUERYResult[number];
}

interface GenerateSampleReceiptDocumentProps {
  project: PROJECT_BY_ID_QUERYResult[number];
  sampleReceiptData: SampleReceiptData;
  existingSampleReceipt?: PROJECT_BY_ID_QUERYResult[number]["sampleReceipt"];
  onCloseDrawers?: () => void;
  isReadOnly?: boolean;
  onApprove?: () => void;
}

export const GenerateSampleReceiptDocument = ({
  project,
  sampleReceiptData,
  existingSampleReceipt,
  onCloseDrawers,
  isReadOnly = false,
  onApprove,
}: GenerateSampleReceiptDocumentProps) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Check if this is an update operation (existing sample receipt) - reactive to live data changes
  const isUpdate = React.useMemo(
    () => Boolean(existingSampleReceipt),
    [existingSampleReceipt]
  );

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
      !sampleReceiptData.sampleReceiptName ||
      sampleReceiptData.sampleReceiptName.trim() === ""
    ) {
      toast.warning("Please select sample receipt personnel before reviewing");
      return false;
    }

    return true;
  };

  const handleOpenReview = () => {
    // Allow opening without validation toasts
    setOpen(true);
  };

  // Check if form is complete for visual indication
  const isFormComplete = useMemo(() => {
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
      sampleReceiptData.sampleReceiptName?.trim()
    );
  }, [sampleReceiptData]);

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
    // Validate form before allowing creation/update
    if (!validateSampleReceiptData()) {
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();

      // Add project ID (needed for cache invalidation)
      formData.append("projectId", project._id);

      // Add sample receipt ID for updates
      if (isUpdate && existingSampleReceipt?._id) {
        formData.append("sampleReceiptId", existingSampleReceipt._id);
      }

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
          name: sampleReceiptData.sampleReceiptName,
          role: sampleReceiptData.personnel?.departmentRoles?.[0]?.role,
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

      const result = isUpdate
        ? await updateSampleReceipt({}, formData)
        : await createSampleReceipt({}, formData);

      if (result.status === "ok") {
        toast.success(
          isUpdate
            ? "Sample receipt updated successfully!"
            : "Sample receipt created successfully!"
        );
        setOpen(false); // Close the sheet
        // Close both drawers if callback is provided
        if (onCloseDrawers) {
          onCloseDrawers();
        }
      } else {
        toast.error(
          result.error ||
            (isUpdate
              ? "Failed to update sample receipt"
              : "Failed to create sample receipt")
        );
      }
    } catch (error) {
      console.error("Error creating sample receipt:", error);
      toast.error(
        isUpdate
          ? "Failed to update sample receipt"
          : "Failed to create sample receipt"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveSampleReceipt = async () => {
    if (!existingSampleReceipt?._id) {
      toast.error("No sample receipt found to approve");
      return;
    }

    if (!sampleReceiptData.approvalDecision) {
      toast.error("Please select an approval decision");
      return;
    }

    if (
      sampleReceiptData.approvalDecision === "reject" &&
      !sampleReceiptData.rejectionReason?.trim()
    ) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    if (
      sampleReceiptData.approvalDecision === "approve" &&
      (!sampleReceiptData.expectedDeliveryDate ||
        !sampleReceiptData.sampleRetentionDuration)
    ) {
      toast.error(
        "Expected delivery date and sample retention duration are required for approval"
      );
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("sampleReceiptId", existingSampleReceipt._id);
      formData.append("projectId", project._id);
      formData.append(
        "getlabAcknowledgement",
        sampleReceiptData.getlabAcknowledgement
      );
      formData.append("approvalDecision", sampleReceiptData.approvalDecision);
      formData.append(
        "rejectionReason",
        sampleReceiptData.rejectionReason || ""
      );
      formData.append(
        "expectedDeliveryDate",
        sampleReceiptData.expectedDeliveryDate || ""
      );
      formData.append(
        "sampleRetentionDuration",
        sampleReceiptData.sampleRetentionDuration || ""
      );

      const result = await approveSampleReceipt({}, formData);

      if (result.status === "ok") {
        toast.success(
          `Sample receipt ${sampleReceiptData.approvalDecision === "approve" ? "approved" : "rejected"} successfully!`
        );
        setOpen(false);
        if (onApprove) {
          onApprove();
        }
        if (onCloseDrawers) {
          onCloseDrawers();
        }
      } else {
        toast.error(result.error || "Failed to process sample receipt");
      }
    } catch (error) {
      console.error("Failed to process sample receipt:", error);
      toast.error("Failed to process sample receipt");
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
                {isReadOnly ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleApproveSampleReceipt}
                    disabled={!sampleReceiptData.approvalDecision}
                    className={
                      !sampleReceiptData.approvalDecision
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {sampleReceiptData.approvalDecision === "reject"
                      ? "Reject"
                      : "Approve"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateSampleReceipt}
                    disabled={!isFormComplete}
                    className={
                      !isFormComplete ? "opacity-50 cursor-not-allowed" : ""
                    }
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isUpdate
                      ? "Update Sample Receipt"
                      : "Create Sample Receipt"}
                  </Button>
                )}
                {/* <Button
                  type="button"
                  size="sm"
                  onClick={handleDownloadPDF}
                  disabled={!isFormComplete}
                  className={
                    !isFormComplete ? "opacity-50 cursor-not-allowed" : ""
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button> */}
              </>
            )}
            {!isFormComplete && !isReadOnly && (
              <Badge variant="outline" className="text-xs text-orange-500">
                Complete form to enable action
              </Badge>
            )}
            {isReadOnly && !sampleReceiptData.approvalDecision && (
              <Badge variant="outline" className="text-xs text-orange-500">
                Select approval decision to enable action
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
