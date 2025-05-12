import { Document, pdf, PDFDownloadLink } from "@react-pdf/renderer";
import dynamic from "next/dynamic";

import { Project } from "../../projects/types";
import { Menu, PlaneIcon, Receipt, RocketIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FieldService,
  MobilizationService,
  ReportingService,
  Service,
} from "@/features/customer/services/data/schema";
import { BillingDocument } from "./billingDocument";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";
import React from "react";
import {
  ALL_SERVICES_QUERYResult,
  PROJECT_BY_ID_QUERYResult,
} from "../../../../../sanity.types";
import Loading from "@/app/loading";
import { createQuotation, deleteAsset, uploadPDFDocument } from "@/lib/actions";

interface GenerateBillingDocumentProps {
  revisionNumber: string;
  quotationNumber: string;
  quotationDate: string;
  acquisitionNumber: string;
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

export const GenerateBillingDocument = (
  billingInfo: GenerateBillingDocumentProps
) => {
  const {
    revisionNumber,
    quotationNumber,
    quotationDate,
    acquisitionNumber,
    currency,
    paymentNotes,
    vatPercentage,
    labTests,
    fieldTests,
    reportingActivities,
    mobilizationActivities,
    project,
  } = billingInfo;

  const isMobile = useMediaQuery("(max-width: 640px)");

  const Doc = (
    <Document>
      <BillingDocument
        revisionNumber={revisionNumber}
        quotationNumber={quotationNumber}
        quotationDate={quotationDate}
        acquisitionNumber={acquisitionNumber}
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
  );

  const handleUploadToSanity = async () => {
    const blob = await pdf(Doc).toBlob();
    const formData = new FormData();
    formData.append("files", blob, `Quotation-${quotationNumber}.pdf`);
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    // if file fails to upload, show error message
    await createQuotation(billingInfo, result.files[0].fileId);
    // await uploadPDFDocument(blob, `Quotation-${quotationNumber}.pdf`);
  };

  const handleDeleteAsset = async () => {
    await deleteAsset();
  };

  const PDFViewer = dynamic(() => import("@/components/pdf-viewer"), {
    loading: () => <Loading />,
    ssr: false,
  });

  return (
    // <Button type="button" size="sm" onClick={handleOpenInNewTab}>
    //   <Receipt className="mr-2" strokeWidth={1} />
    //   <PDFDownloadLink document={Doc} fileName="Quotation.pdf">
    //     {({ blob, url, loading, error }) =>
    //       loading ? "Loading document..." : "Generate quotation"
    //     }
    //   </PDFDownloadLink>
    // </Button>

    <Sheet>
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
            <Button type="button" size="sm" onClick={handleUploadToSanity}>
              <RocketIcon className="mr-2 h-4 w-4" />
              Create Quotation
            </Button>
            <Button variant="secondary" size="icon" onClick={handleDeleteAsset}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <PDFViewer width="100%" height={600}>
            {Doc}
          </PDFViewer>
        </div>
      </SheetContent>
    </Sheet>
  );
};
