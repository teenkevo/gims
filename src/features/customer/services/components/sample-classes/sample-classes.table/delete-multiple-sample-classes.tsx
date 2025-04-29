import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@/components/ui/drawer";
import { DestructiveButtonLoading } from "@/components/button-loading";
import { toast } from "sonner";
import { useActionState } from "react";
import { deleteMultipleSampleClasses } from "@/lib/actions";
import { ALL_SAMPLE_CLASSES_QUERYResult } from "../../../../../../../sanity.types";
import { AlertTriangle, File } from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
export function DeleteMultipleSampleClasses({
  ids,
  sampleClasses,
  open,
  onClose,
  referencingDocs,
}: {
  ids: string[];
  sampleClasses: ALL_SAMPLE_CLASSES_QUERYResult;
  open: boolean;
  onClose: () => void;
  referencingDocs: any[];
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const action = async (_: void | null) => {
    const result = await deleteMultipleSampleClasses(ids);

    if (result.status === "ok") {
      toast.success(
        `Only ${result.deletedItems} sample class${
          (result.deletedItems ?? 0) > 1 ? "s have " : " has "
        } been deleted`
      );
      onClose();
    } else if (result.status === "no_deletions") {
      toast.warning(
        `These sample classes cannot be deleted as they have services referencing them `
      );
    } else {
      toast.warning(
        `Some sample classes cannot be deleted as they have services referencing them `
      );
    }
  };

  const [_, dispatch, isPending] = useActionState(action, null);

  const sampleClassesWithReferencingDocs = referencingDocs.filter(
    (doc) => doc.documents.length > 0
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          className="sm:max-w-3xl"
        >
          <DialogHeader className="space-y-3">
            <DialogTitle>Delete Sample Classes</DialogTitle>
            {sampleClassesWithReferencingDocs.length === 0 && (
              <DialogDescription>
                This sample class will be deleted and won't be available for use
                in future standards
              </DialogDescription>
            )}
            {sampleClassesWithReferencingDocs.length > 0 ? (
              <>
                <div className="flex items-center gap-2 bg-orange-500/10 text-orange-500 p-3 rounded text-sm">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  {sampleClassesWithReferencingDocs.length} sample class
                  {sampleClassesWithReferencingDocs.length > 1 ? "s " : " "}
                  {sampleClassesWithReferencingDocs.length > 1
                    ? "have "
                    : "has "}
                  services referencing{" "}
                  {sampleClassesWithReferencingDocs.length > 1
                    ? "them "
                    : "it "}{" "}
                  and you may not be able to delete{" "}
                  {sampleClassesWithReferencingDocs.length > 1
                    ? "them "
                    : "it "}{" "}
                </div>
                <div className="flex flex-col gap-6">
                  {sampleClassesWithReferencingDocs.map((doc) => (
                    <div key={uuidv4()}>
                      <span className="text-sm font-bold">
                        {
                          sampleClasses.find((t) => t._id === doc.sampleClassId)
                            ?.name
                        }{" "}
                        <span className="text-muted-foreground font-normal">
                          is referenced by the following{" "}
                          {doc.documents.length > 1 ? "services" : "service"}
                        </span>
                      </span>
                      <div className="mt-1 flex flex-col gap-4 border border-dashed border-orange-500/50 p-3 rounded text-sm">
                        {doc.documents.map((doc: any) => (
                          <Link
                            className="flex items-center gap-2 hover:underline underline-offset-2"
                            href={`/services/${doc._id}`}
                            key={doc._id}
                          >
                            <File className="h-4 w-4 mr-2 text-muted-foreground" />
                            {doc.code} - {doc.testParameter}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
                  <span className="font-bold">Warning</span>: This action is not
                  reversible. Please be certain
                </div>
              </>
            )}
          </DialogHeader>
          <DialogFooter>
            <DrawerClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DrawerClose>
            {isPending ? (
              <DestructiveButtonLoading />
            ) : (
              <Button
                onClick={() => React.startTransition(() => dispatch())}
                variant="destructive"
                type="submit"
              >
                Delete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DrawerHeader className="gap-3 text-left">
          <DialogTitle>Delete Sample Classes</DialogTitle>
          <DialogDescription>
            These sample classes will be deleted and won't be available for use
            in future services
          </DialogDescription>
          <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
            <span className="font-bold">Warning</span>: This action is not
            reversible. Please be certain
          </div>
        </DrawerHeader>

        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DrawerClose>
          {isPending ? (
            <DestructiveButtonLoading />
          ) : (
            <Button
              onClick={() => React.startTransition(() => dispatch())}
              variant="destructive"
              type="submit"
            >
              Delete
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
