import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { QuotationOptions } from "./quotation-options";
import type { PROJECT_BY_ID_QUERYResult } from "../../../../../sanity.types";
import type { SetStateAction } from "react";
import type { Dispatch } from "react";
import type { ALL_SERVICES_QUERYResult } from "../../../../../sanity.types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function QuotationReviewDrawer({
  allServices,
  project,
  selectedLabTests,
  setSelectedLabTests,
  selectedFieldTests,
  setSelectedFieldTests,
  mobilizationActivities,
  setMobilizationActivities,
  reportingActivities,
  setReportingActivities,
}: {
  allServices: ALL_SERVICES_QUERYResult;
  project: PROJECT_BY_ID_QUERYResult[number];
  selectedLabTests: ALL_SERVICES_QUERYResult;
  setSelectedLabTests: Dispatch<SetStateAction<ALL_SERVICES_QUERYResult>>;
  selectedFieldTests: ALL_SERVICES_QUERYResult;
  setSelectedFieldTests: Dispatch<SetStateAction<ALL_SERVICES_QUERYResult>>;
  mobilizationActivities: {
    activity: string;
    price: number;
    quantity: number;
  }[];
  setMobilizationActivities: Dispatch<
    SetStateAction<{ activity: string; price: number; quantity: number }[]>
  >;
  reportingActivities: { activity: string; price: number; quantity: number }[];
  setReportingActivities: Dispatch<
    SetStateAction<{ activity: string; price: number; quantity: number }[]>
  >;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = React.useState(false);

  if (isDesktop) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button size="sm">Review Quotation</Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-6xl flex flex-col h-full">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle>Quotation Review</SheetTitle>
            <SheetDescription>
              Review the quotation and make changes if necessary.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-4">
            <QuotationOptions
              allServices={allServices}
              project={project}
              selectedLabTests={selectedLabTests}
              setSelectedLabTests={setSelectedLabTests}
              selectedFieldTests={selectedFieldTests}
              setSelectedFieldTests={setSelectedFieldTests}
              mobilizationActivities={mobilizationActivities}
              setMobilizationActivities={setMobilizationActivities}
              reportingActivities={reportingActivities}
              setReportingActivities={setReportingActivities}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="sm">Review Quotation</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left flex-shrink-0">
          <DrawerTitle>Quotation Review</DrawerTitle>
          <DrawerDescription>
            Review the quotation and make changes if necessary.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto max-h-[calc(80vh-10rem)]">
          <QuotationOptions
            allServices={allServices}
            project={project}
            selectedLabTests={selectedLabTests}
            setSelectedLabTests={setSelectedLabTests}
            selectedFieldTests={selectedFieldTests}
            setSelectedFieldTests={setSelectedFieldTests}
            mobilizationActivities={mobilizationActivities}
            setMobilizationActivities={setMobilizationActivities}
            reportingActivities={reportingActivities}
            setReportingActivities={setReportingActivities}
          />
        </div>
        <DrawerFooter className="pt-2 flex-shrink-0">
          <DrawerClose asChild>
            <Button size="sm">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
