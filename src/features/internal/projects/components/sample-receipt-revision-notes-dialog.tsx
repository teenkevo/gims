import { useEffect, useState } from "react";
import { AlertTriangle, MessageSquareMore } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

interface SampleReceiptRevisionNotesDialogProps {
  revisionText: string;
}

export function SampleReceiptRevisionNotesDialog({
  revisionText,
}: SampleReceiptRevisionNotesDialogProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="secondary" size="icon">
            <MessageSquareMore className="h-4 w-4 animate-bounce" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <DrawerTitle>GETLAB Rejection Notes</DrawerTitle>
            </div>
            <DrawerDescription>
              Please review the following rejection notes from GETLAB.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <div className="rounded-lg border bg-muted/50 p-4 max-h-[40vh] overflow-y-auto">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {revisionText}
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setOpen(false)}>Got it</Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon">
          <MessageSquareMore className="h-4 w-4 animate-bounce" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>GETLAB Rejection Notes</DialogTitle>
          </div>
          <DialogDescription>
            Please review the following rejection notes from GETLAB.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4 max-h-[50vh] overflow-y-auto">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {revisionText}
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>Got it</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
