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
import { deleteFileFromTestMethod } from "@/lib/actions";
import { AlertTriangle, File } from "lucide-react";
import Link from "next/link";

export function DeleteFile({
  id,
  open,
  onClose,
  referencingDocs,
  currentTestMethodId,
  fileKey,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  referencingDocs: any[];
  currentTestMethodId: string;
  fileKey: string;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const action = async (_: void | null) => {
    const result = await deleteFileFromTestMethod(
      id,
      fileKey,
      currentTestMethodId
    );
    if (result.status === "ok") {
      toast.success("File has been deleted");
      onClose();
    } else {
      toast.error("Something went wrong");
    }
  };

  const referencingDocsOtherThanCurrentTestMethod = referencingDocs.filter(
    (doc) => doc._id !== currentTestMethodId
  );

  const currentTestMethod = referencingDocs.find(
    (doc) => doc._id === currentTestMethodId
  );

  const [_, dispatch, isPending] = useActionState(action, null);

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
            <DialogTitle>Delete File</DialogTitle>
            {referencingDocsOtherThanCurrentTestMethod.length === 0 && (
              <DialogDescription>
                This file will be deleted from the test method
              </DialogDescription>
            )}
            {referencingDocsOtherThanCurrentTestMethod.length > 0 ? (
              <>
                <div className="flex items-center gap-2 bg-orange-500/10 text-orange-500 p-3 rounded text-sm">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  {referencingDocsOtherThanCurrentTestMethod.length}{" "}
                  {referencingDocsOtherThanCurrentTestMethod.length > 1
                    ? "other test methods are "
                    : "other test method is "}
                  still using the file.
                </div>
                <div className="flex flex-col gap-4 border border-dashed border-orange-500/50 p-3 rounded text-sm">
                  {referencingDocsOtherThanCurrentTestMethod.map((doc) => (
                    <Link
                      className="flex items-center gap-2 hover:underline underline-offset-2"
                      href={`/services/test-methods/${doc._id}`}
                      key={doc._id}
                    >
                      <File className="h-4 w-4 mr-2 text-muted-foreground" />
                      {doc.code}
                    </Link>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  This file will just be unlinked from{" "}
                  <span className="font-bold text-foreground">
                    {currentTestMethod?.code}
                  </span>
                </p>
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
                {referencingDocsOtherThanCurrentTestMethod.length > 0
                  ? "Unlink file from test method"
                  : "Delete"}
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
          <DialogTitle>Delete File</DialogTitle>
          {referencingDocsOtherThanCurrentTestMethod.length === 0 && (
            <DialogDescription>
              This file will be deleted from the test method
            </DialogDescription>
          )}
          {referencingDocsOtherThanCurrentTestMethod.length > 0 ? (
            <>
              <div className="flex items-center gap-2 bg-orange-500/10 text-orange-500 p-3 rounded text-sm">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {referencingDocsOtherThanCurrentTestMethod.length}{" "}
                {referencingDocsOtherThanCurrentTestMethod.length > 1
                  ? "other test methods are "
                  : "other test method is "}
                still using the file.
              </div>
              <div className="flex flex-col gap-4 border border-dashed border-orange-500/50 p-3 rounded text-sm">
                {referencingDocsOtherThanCurrentTestMethod.map((doc) => (
                  <Link
                    className="flex items-center gap-2 hover:underline underline-offset-2"
                    href={`/services/test-methods/${doc._id}`}
                    key={doc._id}
                  >
                    <File className="h-4 w-4 mr-2 text-muted-foreground" />
                    {doc.code}
                  </Link>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                This file will just be unlinked from{" "}
                <span className="font-bold text-foreground">
                  {currentTestMethod?.code}
                </span>
              </p>
            </>
          ) : (
            <>
              <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
                <span className="font-bold">Warning</span>: This action is not
                reversible. Please be certain
              </div>
            </>
          )}
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
