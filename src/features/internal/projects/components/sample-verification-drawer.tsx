"use client";

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
import { SampleVerificationContent } from "@/features/internal/projects/components/sample-verification-content";
import {
  PROJECT_BY_ID_QUERYResult,
  ALL_PERSONNEL_QUERYResult,
} from "../../../../../sanity.types";

export function SampleVerificationDrawer({
  children,
  project,
  personnel,
}: {
  children: React.ReactNode;
  project: PROJECT_BY_ID_QUERYResult[number];
  personnel: ALL_PERSONNEL_QUERYResult;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = React.useState(false);
  const [showWarning, setShowWarning] = React.useState(false);
  const [hasUnsavedEdits, setHasUnsavedEdits] = React.useState(false);

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
    setHasUnsavedEdits(false);
  };

  if (isDesktop) {
    return (
      <>
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>{children}</SheetTrigger>
          <SheetContent className="w-full sm:max-w-7xl flex flex-col h-full">
            <SheetHeader className="flex-shrink-0 border-b border-border pb-5">
              <SheetTitle>Sample Receipt Verification</SheetTitle>
              <SheetDescription>
                Complete the sample receipt verification process for the
                project.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto py-4">
              <SampleVerificationContent
                setDrawerOpen={setOpen}
                setHasUnsavedEdits={setHasUnsavedEdits}
                project={project}
                personnel={personnel}
              />
            </div>
          </SheetContent>
        </Sheet>

        <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes to the sample verification. Are you
                sure you want to close? All changes will be lost.
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
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left flex-shrink-0">
            <DrawerTitle>Sample Receipt Verification</DrawerTitle>
            <DrawerDescription>
              Complete the sample receipt verification process for the project.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto max-h-[calc(80vh-10rem)]">
            <SampleVerificationContent
              setDrawerOpen={setOpen}
              setHasUnsavedEdits={setHasUnsavedEdits}
              project={project}
              personnel={personnel}
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
              You have unsaved changes to the sample verification. Are you sure
              you want to close? All changes will be lost.
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
