import { Document, pdf, PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";

import { Project } from "../../projects/types";
import { Menu, Receipt } from "lucide-react";
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
import { PROJECT_BY_ID_QUERYResult } from "../../../../../sanity.types";

interface GenerateBillingDocumentProps {
  labTests: Service[];
  fieldTests: FieldService[];
  reportingActivity: ReportingService;
  mobilizationActivity: MobilizationService;
  project: PROJECT_BY_ID_QUERYResult[number];
}

export const GenerateBillingDocument = (
  billingInfo: GenerateBillingDocumentProps
) => {
  const {
    labTests,
    fieldTests,
    reportingActivity,
    mobilizationActivity,
    project,
  } = billingInfo;

  const isMobile = useMediaQuery("(max-width: 640px)");

  const Doc = (
    <Document>
      <BillingDocument
        labTests={labTests}
        fieldTests={fieldTests}
        reportingActivity={reportingActivity}
        mobilizationActivity={mobilizationActivity}
        project={project}
      />
    </Document>
  );

  const handleOpenInNewTab = async () => {
    const blob = await pdf(Doc).toBlob();
    const url = URL.createObjectURL(blob);
    setTimeout(() => {
      window.open(url, "_blank");
    });
  };

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
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile ? "h-[80vh] rounded-t-2xl p-4" : "h-full rounded-l-2xl"
        }
      >
        <SheetHeader className="text-start">
          <SheetTitle className="text-lg md:text-2xl">Quotation</SheetTitle>
          <SheetDescription>
            <Badge>Draft</Badge>
          </SheetDescription>
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
