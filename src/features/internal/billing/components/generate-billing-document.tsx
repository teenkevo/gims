import { Document, pdf } from "@react-pdf/renderer";
import dynamic from "next/dynamic";

import { Receipt, RocketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

import { BillingDocument } from "./billingDocument";
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
import {
  ALL_SERVICES_QUERYResult,
  PROJECT_BY_ID_QUERYResult,
} from "../../../../../sanity.types";
import Loading from "@/app/loading";
import {
  createQuotation,
  createRevision,
  updateQuotation,
} from "@/lib/actions";
import { toast } from "sonner";
import { ButtonLoading } from "@/components/button-loading";
import { useQuotation } from "./useQuotation";
import { useRBAC } from "@/components/rbac-context";

interface GenerateBillingDocumentProps {
  currency: string;
  paymentNotes: string;
  vatPercentage: number;
  labTests: (ALL_SERVICES_QUERYResult[number] & {
    price: number;
    quantity: number;
  })[];
  fieldTests: (ALL_SERVICES_QUERYResult[number] & {
    price: number;
    quantity: number;
  })[];
  reportingActivities: {
    activity: string;
    price: number;
    quantity: number;
  }[];
  mobilizationActivities: {
    activity: string;
    price: number;
    quantity: number;
  }[];
  project: PROJECT_BY_ID_QUERYResult[number];
}

export const GenerateBillingDocument = ({
  setDrawerOpen,
  billingInfo,
}: {
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  billingInfo: GenerateBillingDocumentProps;
}) => {
  const {
    currency,
    paymentNotes,
    vatPercentage,
    labTests,
    fieldTests,
    reportingActivities,
    mobilizationActivities,
    project,
  } = billingInfo;

  const date = new Date();
  const year = date.getFullYear();
  const uniqueNumber = `${year}-${Date.now().toString().slice(-6)}${Math.floor(
    Math.random() * 1000
  )
    .toString()
    .padStart(3, "0")}`;

  const { role } = useRBAC();

  const { quotation, quotationNeedsRevision, number_parent_revisions } =
    useQuotation(project, role);

  const revisionNumber = quotationNeedsRevision
    ? `R${year}-${String(number_parent_revisions + 1).padStart(2, "0")}`
    : `R${year}-00`;

  const quotationNumber =
    quotationNeedsRevision || quotation
      ? quotation?.quotationNumber
      : `Q${uniqueNumber}`;
  const acquisitionNumber =
    quotationNeedsRevision || quotation
      ? quotation?.quotationNumber
      : `A${uniqueNumber}`;
  const quotationDate = date.toISOString();

  const finalBillingInfo = {
    ...billingInfo,
    quotationNumber: quotationNumber || "",
    acquisitionNumber: acquisitionNumber || "",
    quotationDate: quotationDate || "",
    revisionNumber: revisionNumber || "",
  };

  const isMobile = useMediaQuery("(max-width: 640px)");

  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const Doc = useMemo(
    () => (
      <Document>
        <BillingDocument
          isInvoice={false}
          revisionNumber={revisionNumber}
          quotationNumber={quotationNumber || ""}
          quotationDate={quotationDate}
          acquisitionNumber={acquisitionNumber || ""}
          currency={currency}
          labTests={labTests}
          fieldTests={fieldTests}
          reportingActivities={reportingActivities}
          mobilizationActivities={mobilizationActivities}
          project={project}
          paymentNotes={paymentNotes}
          vatPercentage={vatPercentage}
        />
      </Document>
    ),
    [billingInfo]
  );

  // CREATE QUOTATION
  const handleCreateQuotation = async () => {
    setIsLoading(true);
    try {
      const blob = await pdf(Doc).toBlob();
      const formData = new FormData();
      formData.append("files", blob, `Quotation-${quotationNumber}.pdf`);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const fileResult = await response.json();
      // if file fails to upload, show error message
      const result = await createQuotation(
        finalBillingInfo,
        fileResult.files[0].fileId
      );
      if (result.status === "ok") {
        setIsLoading(false);
        toast.success("Quotation has been created");
        setOpen(false);
        setDrawerOpen(false);
      } else {
        setIsLoading(false);
        toast.error("Something went wrong");
      }
    } catch (error) {
      setIsLoading(false);
      toast.error("Something went wrong");
    }
  };

  // UPDATE QUOTATION
  const handleUpdateQuotation = async () => {
    setIsLoading(true);
    try {
      const blob = await pdf(Doc).toBlob();
      const formData = new FormData();
      formData.append("files", blob, `Quotation-${quotationNumber}.pdf`);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const fileResult = await response.json();
      const result = await updateQuotation(
        project.quotation?._id || "",
        finalBillingInfo,
        fileResult.files[0].fileId
      );
      if (result.status === "ok") {
        setIsLoading(false);
        toast.success("Quotation has been updated");
        setOpen(false);
        setDrawerOpen(false);
      } else {
        setIsLoading(false);
        toast.error("Something went wrong");
      }
    } catch (error) {
      setIsLoading(false);
      toast.error("Something went wrong");
    }
  };

  // CREATE REVISION
  const handleCreateRevision = async () => {
    setIsLoading(true);
    try {
      const blob = await pdf(Doc).toBlob();
      const formData = new FormData();
      formData.append("files", blob, `Quotation-${quotationNumber}.pdf`);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const fileResult = await response.json();
      // if file fails to upload, show error message
      const result = await createRevision(
        finalBillingInfo,
        fileResult.files[0].fileId
      );
      if (result.status === "ok") {
        setIsLoading(false);
        toast.success("Quotation has been created");
        setOpen(false);
        setDrawerOpen(false);
      } else {
        setIsLoading(false);
        toast.error("Something went wrong");
      }
    } catch (error) {
      setIsLoading(false);
      toast.error("Something went wrong");
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
        >
          <Receipt className="mr-2" strokeWidth={1} />
          Review Quotation
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
            Quotation <Badge variant="outline">Draft</Badge>
          </SheetTitle>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <ButtonLoading />
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={
                  quotation && !quotationNeedsRevision
                    ? handleUpdateQuotation
                    : quotation && quotationNeedsRevision
                      ? handleCreateRevision
                      : handleCreateQuotation
                }
              >
                <RocketIcon className="mr-2 h-4 w-4" />
                {quotation && !quotationNeedsRevision
                  ? "Update Quotation"
                  : quotation && quotationNeedsRevision
                    ? "Send Revised Quotation"
                    : "Create Quotation"}
              </Button>
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
            <Loading text="Generating Quotation..." />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
