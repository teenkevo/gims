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
import type { PROJECT_BY_ID_QUERY_RESULT } from "../../../../../sanity.types";
import type { SetStateAction } from "react";
import type { Dispatch } from "react";
import type { ALL_SERVICES_QUERY_RESULT } from "../../../../../sanity.types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRBAC } from "@/components/rbac-context";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useQuotation } from "./useQuotation";

type ActivitySnapshot = {
  activity: string;
  unit: string;
  price: number;
  quantity: number;
};

function selectedServiceSnapshot(services: ALL_SERVICES_QUERY_RESULT) {
  return services
    .map((service) => ({
      id: service._id,
      price: (service as { price?: number }).price ?? null,
      quantity: (service as { quantity?: number }).quantity ?? null,
      unit: (service as { unit?: string }).unit ?? null,
      method:
        service.testMethods?.find(
          (method) => (method as { selected?: boolean }).selected
        )?.standard?.acronym ?? null,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function activitySnapshot(activities: ActivitySnapshot[]) {
  return activities.map((activity) => ({
    activity: activity.activity,
    unit: activity.unit,
    price: activity.price,
    quantity: activity.quantity,
  }));
}

function quotationEditSnapshot({
  selectedLabTests,
  selectedFieldTests,
  mobilizationActivities,
  reportingActivities,
}: {
  selectedLabTests: ALL_SERVICES_QUERY_RESULT;
  selectedFieldTests: ALL_SERVICES_QUERY_RESULT;
  mobilizationActivities: ActivitySnapshot[];
  reportingActivities: ActivitySnapshot[];
}) {
  return JSON.stringify({
    lab: selectedServiceSnapshot(selectedLabTests),
    field: selectedServiceSnapshot(selectedFieldTests),
    mobilization: activitySnapshot(mobilizationActivities),
    reporting: activitySnapshot(reportingActivities),
  });
}

export function QuotationDrawer({
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
  allServices: ALL_SERVICES_QUERY_RESULT;
  project: PROJECT_BY_ID_QUERY_RESULT[number];
  selectedLabTests: ALL_SERVICES_QUERY_RESULT;
  setSelectedLabTests: Dispatch<SetStateAction<ALL_SERVICES_QUERY_RESULT>>;
  selectedFieldTests: ALL_SERVICES_QUERY_RESULT;
  setSelectedFieldTests: Dispatch<SetStateAction<ALL_SERVICES_QUERY_RESULT>>;
  mobilizationActivities: {
    activity: string;
    unit: string;
    price: number;
    quantity: number;
  }[];
  setMobilizationActivities: Dispatch<
    SetStateAction<
      { activity: string; unit: string; price: number; quantity: number }[]
    >
  >;
  reportingActivities: {
    activity: string;
    unit: string;
    price: number;
    quantity: number;
  }[];
  setReportingActivities: Dispatch<
    SetStateAction<
      { activity: string; unit: string; price: number; quantity: number }[]
    >
  >;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = React.useState(false);
  const [showWarning, setShowWarning] = React.useState(false);
  const [baselineReady, setBaselineReady] = React.useState(false);
  const baselineRef = React.useRef<string | null>(null);
  const baselineLockedRef = React.useRef(false);

  const { role, can, isClientUser } = useRBAC();

  const { quotation, quotationNeedsRevision } = useQuotation(project, role);

  const canCreateBilling = can(PERMISSIONS["billing:create"]);
  const canUpdateBilling = can(PERMISSIONS["billing:update"]);
  const canShowDrawer =
    !isClientUser &&
    ((!quotation && canCreateBilling) ||
      (quotationNeedsRevision && canCreateBilling) ||
      (quotation && !quotationNeedsRevision && canUpdateBilling));

  // Capture baseline after child tables/managers finish hydrating from the saved
  // quotation. Debounce until state settles, then lock so later user edits count
  // as dirty instead of rewriting the baseline.
  React.useEffect(() => {
    if (!open) {
      baselineRef.current = null;
      baselineLockedRef.current = false;
      setBaselineReady(false);
      return;
    }

    if (baselineLockedRef.current) return;

    const timer = window.setTimeout(() => {
      baselineRef.current = quotationEditSnapshot({
        selectedLabTests,
        selectedFieldTests,
        mobilizationActivities,
        reportingActivities,
      });
      baselineLockedRef.current = true;
      setBaselineReady(true);
    }, 200);

    return () => window.clearTimeout(timer);
  }, [
    open,
    selectedLabTests,
    selectedFieldTests,
    mobilizationActivities,
    reportingActivities,
  ]);

  if (!canShowDrawer) {
    return null;
  }

  const currentSnapshot = quotationEditSnapshot({
    selectedLabTests,
    selectedFieldTests,
    mobilizationActivities,
    reportingActivities,
  });

  const hasUnsavedEdits =
    open &&
    baselineReady &&
    baselineRef.current !== null &&
    currentSnapshot !== baselineRef.current;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && hasUnsavedEdits) {
      setShowWarning(true);
    } else {
      setOpen(newOpen);
    }
  };

  const handleDiscardChanges = () => {
    setShowWarning(false);
    setOpen(false);
  };

  if (isDesktop) {
    return (
      <>
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>
            <Button
              size="sm"
              className="shadow-md"
              variant={
                quotation && !quotationNeedsRevision ? "outline" : "default"
              }
            >
              {quotation && !quotationNeedsRevision
                ? "Review"
                : quotation && quotationNeedsRevision
                  ? "Revise"
                  : "Create Quotation"}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-7xl flex flex-col h-full">
            <SheetHeader className="flex-shrink-0 border-b border-border pb-5">
              <SheetTitle>
                {quotation ? "Review Quotation" : "Create Quotation"}
              </SheetTitle>
              <SheetDescription>
                {quotation
                  ? "Review the quotation and make changes if necessary."
                  : "Create a quotation for the project."}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto py-4">
              <QuotationOptions
                setDrawerOpen={setOpen}
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
                editable={canCreateBilling || canUpdateBilling}
              />
            </div>
          </SheetContent>
        </Sheet>

        <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes to the quotation. Are you sure you want
                to close? All changes will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue Editing</AlertDialogCancel>
              <AlertDialogAction onClick={handleDiscardChanges}>
                Discard Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>
          <Button
            size="sm"
            className="shadow-md"
            variant={
              quotation && !quotationNeedsRevision ? "outline" : "default"
            }
          >
            {quotation && !quotationNeedsRevision
              ? "Review"
              : quotation && quotationNeedsRevision
                ? "Revise"
                : "Create Quotation"}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left flex-shrink-0">
            <DrawerTitle>
              {quotation ? "Review Quotation" : "Create Quotation"}
            </DrawerTitle>
            <DrawerDescription>
              {quotation
                ? "Review the quotation and make changes if necessary."
                : "Create a quotation for the project."}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto max-h-[calc(80vh-10rem)]">
            <QuotationOptions
              setDrawerOpen={setOpen}
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
              editable={canCreateBilling || canUpdateBilling}
            />
          </div>
          <DrawerFooter className="pt-2 flex-shrink-0">
            <DrawerClose asChild>
              <Button variant="secondary" className="w-[100px]" size="sm">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to the quotation. Are you sure you want
              to close? All changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardChanges}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
