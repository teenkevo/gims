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
import { deleteTestMethod } from "@/lib/actions";
import { ALL_TEST_METHODS_QUERYResult } from "../../../../../../../../sanity.types";
import { AlertTriangle, File } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function DeleteTestMethod({
  testMethod,
  open,
  onClose,
  referencingDocs,
  redirect,
}: {
  testMethod: ALL_TEST_METHODS_QUERYResult[number];
  open: boolean;
  onClose: () => void;
  referencingDocs: any[];
  redirect?: boolean;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const router = useRouter();

  const action = async (_: void | null) => {
    const result = await deleteTestMethod(testMethod._id);
    if (result.status === "ok") {
      toast.success("Test method has been deleted");
      onClose();
      if (redirect) router.push("/services/test-methods");
    } else {
      toast.warning(
        "The test method cannot be deleted. It might have services referencing it"
      );
    }
  };

  const [_, dispatch, isPending] = useActionState(action, null);

  console.log(referencingDocs);

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
            <DialogTitle>Delete Test Method</DialogTitle>
            {referencingDocs.length === 0 && (
              <DialogDescription>
                This test method will be deleted and won't be available for use
                in standards and services
              </DialogDescription>
            )}
            {referencingDocs.length > 0 ? (
              <>
                <div className="flex items-center gap-2 bg-orange-500/10 text-orange-500 p-3 rounded text-sm">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  {referencingDocs.length}{" "}
                  {referencingDocs.length > 1 ? "services are " : "service is "}
                  using the test method
                  <span className="font-bold">"{testMethod.code}"</span>
                </div>
                <p className="text-sm">
                  You may not be able to delete{" "}
                  <span className="font-bold">"{testMethod.code}"</span> because
                  the following{" "}
                  {referencingDocs.length > 1 ? "services are " : "service is "}{" "}
                  using it
                </p>
                <div className="flex flex-col gap-4 border border-dashed border-orange-500/50 p-3 rounded text-sm">
                  {referencingDocs.map((doc) => (
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
          <DialogTitle>Delete Test Method</DialogTitle>
          {referencingDocs.length === 0 && (
            <DialogDescription>
              This test method will be deleted and won't be available for use in
              standards and services
            </DialogDescription>
          )}
          {referencingDocs.length > 0 ? (
            <>
              <div className="flex items-center gap-2 bg-orange-500/10 text-orange-500 p-3 rounded text-sm">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {referencingDocs.length}{" "}
                {referencingDocs.length > 1 ? "services are " : "service is "}
                using the test method
                <span className="font-bold">"{testMethod.code}"</span>
              </div>
              <p className="text-sm">
                You may not be able to delete{" "}
                <span className="font-bold">"{testMethod.code}"</span> because
                the following{" "}
                {referencingDocs.length > 1 ? "services are " : "service is "}{" "}
                using it
              </p>
              <div className="flex flex-col gap-4 border border-dashed border-orange-500/50 p-3 rounded text-sm">
                {referencingDocs.map((doc) => (
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
