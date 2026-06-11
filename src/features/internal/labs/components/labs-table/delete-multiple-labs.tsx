"use client";

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
import { deleteMultipleLabs } from "@/lib/actions";
import type { ALL_LABS_QUERY_RESULT } from "../../../../../../sanity.types";
import { AlertTriangle, File } from "lucide-react";
import Link from "next/link";

type LabRow = ALL_LABS_QUERY_RESULT[number];

function getBlockedLabs(labs: LabRow[]) {
  return labs.filter((lab) => (lab.projects?.length ?? 0) > 0);
}

function getDeletableLabs(labs: LabRow[]) {
  return labs.filter((lab) => (lab.projects?.length ?? 0) === 0);
}

function DeleteLabsContent({
  labs,
  blockedLabs,
  deletableLabs,
}: {
  labs: LabRow[];
  blockedLabs: LabRow[];
  deletableLabs: LabRow[];
}) {
  return (
    <>
      {blockedLabs.length > 0 && (
        <>
          <div className="flex items-center gap-2 rounded bg-orange-500/10 p-3 text-sm text-orange-500">
            <AlertTriangle className="mr-2 h-5 w-5 shrink-0" />
            {blockedLabs.length} laborator
            {blockedLabs.length > 1 ? "ies have" : "y has"} assigned projects
            and cannot be deleted. Unassign the projects first.
          </div>
          <div className="flex flex-col gap-6">
            {blockedLabs.map((lab) => (
              <div key={lab._id}>
                <span className="text-sm font-bold">
                  {lab.name}{" "}
                  <span className="font-normal text-muted-foreground">
                    ({lab.internalId})
                  </span>
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    is assigned to the following{" "}
                    {(lab.projects?.length ?? 0) > 1 ? "projects" : "project"}
                  </span>
                </span>
                <div className="mt-1 flex flex-col gap-4 rounded border border-dashed border-orange-500/50 p-3 text-sm">
                  {(lab.projects ?? []).map((project) => (
                    <Link
                      className="flex items-center gap-2 underline-offset-2 hover:underline"
                      href={`/projects/${project._id}`}
                      key={project._id}
                    >
                      <File className="mr-2 h-4 w-4 text-muted-foreground" />
                      {project.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {deletableLabs.length > 0 && (
        <>
          {blockedLabs.length > 0 ? (
            <DialogDescription>
              Only {deletableLabs.length} laborator
              {deletableLabs.length > 1 ? "ies" : "y"} will be deleted.
            </DialogDescription>
          ) : (
            <DialogDescription>
              {labs.length > 1
                ? "These laboratories will be permanently removed from the system."
                : "This laboratory will be permanently removed from the system."}
            </DialogDescription>
          )}
          <div className="rounded bg-destructive/10 p-3 text-sm text-destructive">
            <span className="font-bold">Warning</span>: This action is not
            reversible. Associated approval workflows will also be removed.
          </div>
          <ul className="list-inside list-disc text-sm text-muted-foreground">
            {deletableLabs.map((lab) => (
              <li key={lab._id}>
                {lab.name}{" "}
                <span className="text-foreground">({lab.internalId})</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

export function DeleteMultipleLabs({
  labs,
  open,
  onClose,
  onDeleted,
}: {
  labs: LabRow[];
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const blockedLabs = getBlockedLabs(labs);
  const deletableLabs = getDeletableLabs(labs);
  const deletableLabIds = deletableLabs.map((lab) => lab._id);

  const action = async (_: void | null) => {
    const result = await deleteMultipleLabs(deletableLabIds);

    if (result.status === "ok") {
      const deletedCount = result.deletedItems ?? deletableLabIds.length;
      const failedCount =
        result.results?.filter((item) => item.status === "error").length ?? 0;

      if (failedCount > 0) {
        toast.warning(
          `Deleted ${deletedCount} laborator${deletedCount > 1 ? "ies" : "y"}. ${failedCount} could not be deleted because they are referenced elsewhere.`
        );
      } else {
        toast.success(
          deletedCount > 1
            ? `${deletedCount} laboratories have been deleted`
            : "Laboratory has been deleted"
        );
      }

      onClose();
      onDeleted();
      return;
    }

    if (result.status === "no_deletions") {
      toast.error(
        "No laboratories could be deleted. Remove project assignments or other references first."
      );
      return;
    }

    toast.error("Something went wrong");
  };

  const [_, dispatch, isPending] = useActionState(action, null);
  const canDelete = deletableLabs.length > 0;

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
            <DialogTitle>Delete Laboratories</DialogTitle>
            <DeleteLabsContent
              labs={labs}
              blockedLabs={blockedLabs}
              deletableLabs={deletableLabs}
            />
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            {canDelete &&
              (isPending ? (
                <DestructiveButtonLoading />
              ) : (
                <Button
                  onClick={() => React.startTransition(() => dispatch())}
                  variant="destructive"
                  type="submit"
                >
                  Delete {deletableLabs.length}{" "}
                  {deletableLabs.length > 1 ? "laboratories" : "laboratory"}
                </Button>
              ))}
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
          <DialogTitle>Delete Laboratories</DialogTitle>
          <DeleteLabsContent
            labs={labs}
            blockedLabs={blockedLabs}
            deletableLabs={deletableLabs}
          />
        </DrawerHeader>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DrawerClose>
          {canDelete &&
            (isPending ? (
              <DestructiveButtonLoading />
            ) : (
              <Button
                onClick={() => React.startTransition(() => dispatch())}
                variant="destructive"
                type="submit"
              >
                Delete {deletableLabs.length}{" "}
                {deletableLabs.length > 1 ? "laboratories" : "laboratory"}
              </Button>
            ))}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
