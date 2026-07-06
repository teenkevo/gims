"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ALL_CONTACTS_QUERY_RESULT } from "../../../../../sanity.types";
import { useState } from "react";
import { Lock, Pencil, Trash, Unlock } from "lucide-react";
import { UpdateContactDialog } from "./update-contact-dialog";
import { RemoveContactFromProject } from "./remove-contact-from-project";
import { LockContactPortalDialog } from "@/features/customer/clients/components/contacts-table/row-actions/lock-contact-portal-dialog";
import { UnlockContactPortalDialog } from "@/features/customer/clients/components/contacts-table/row-actions/unlock-contact-portal-dialog";
import { useRBAC } from "@/components/rbac-context";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { revalidateProject } from "@/lib/actions";

interface ContactTableRowActionsProps {
  contact: ALL_CONTACTS_QUERY_RESULT[number] & { appAccessStatus?: string };
  projectId: string;
}

export function ContactTableRowActions({
  contact,
  projectId,
}: ContactTableRowActionsProps) {
  const [openDialog, setOpenDialog] = useState<
    "edit" | "remove" | "lock" | "unlock" | null
  >(null);
  const { can } = useRBAC();
  const canUpdateClient = can(PERMISSIONS["clients:update"]);
  const portalStatus = contact.appAccessStatus;
  const canLockPortalAccess =
    portalStatus === "active" || portalStatus === "invited";
  const canUnlockPortalAccess = portalStatus === "revoked";

  const refreshProject = () => {
    void revalidateProject(projectId);
  };

  if (!canUpdateClient) {
    return null;
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            onClick={() => setOpenDialog("edit")}
          >
            <Pencil className="h-4 w-4 mr-2" />
            <span>Edit Contact</span>
          </DropdownMenuItem>
          {canLockPortalAccess && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-sm font-medium text-destructive focus:text-destructive"
                onClick={() => setOpenDialog("lock")}
              >
                <Lock className="h-4 w-4 mr-2" />
                <span>Lock</span>
              </DropdownMenuItem>
            </>
          )}
          {canUnlockPortalAccess && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
                onClick={() => setOpenDialog("unlock")}
              >
                <Unlock className="h-4 w-4 mr-2" />
                <span>Unlock</span>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            onClick={() => setOpenDialog("remove")}
          >
            <Trash className="h-4 w-4 mr-2 text-destructive" />
            <span>Remove from Project</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UpdateContactDialog
        contact={contact}
        open={openDialog === "edit"}
        onClose={() => setOpenDialog(null)}
      />
      <RemoveContactFromProject
        email={contact.email!}
        projectId={projectId}
        contactId={contact._id}
        open={openDialog === "remove"}
        onClose={() => setOpenDialog(null)}
      />
      <LockContactPortalDialog
        contact={contact}
        open={openDialog === "lock"}
        onClose={() => setOpenDialog(null)}
        onSuccess={refreshProject}
      />
      <UnlockContactPortalDialog
        contact={contact}
        open={openDialog === "unlock"}
        onClose={() => setOpenDialog(null)}
        onSuccess={refreshProject}
      />
    </div>
  );
}
