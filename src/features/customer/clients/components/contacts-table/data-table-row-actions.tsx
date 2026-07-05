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
import type { CLIENT_BY_ID_QUERY_RESULT } from "../../../../../../sanity.types";
import { useState } from "react";
import { Lock, Pencil, Trash, Unlock } from "lucide-react";
import { UpdateContactDialog } from "./row-actions/update-contact-dialog";
import { DeleteContactDialog } from "./row-actions/delete-contact-dialog";
import { LockContactPortalDialog } from "./row-actions/lock-contact-portal-dialog";
import { UnlockContactPortalDialog } from "./row-actions/unlock-contact-portal-dialog";
import { toast } from "sonner";
import { useRBAC } from "@/components/rbac-context";
import { PERMISSIONS } from "@/lib/auth/permissions";

interface DataTableRowActionsProps<TData> {
  contact: CLIENT_BY_ID_QUERY_RESULT[number]["contacts"][number];
}

export function DataTableRowActions<TData>({ contact }: DataTableRowActionsProps<TData>) {
  const [openDialog, setOpenDialog] = useState<
    "edit" | "delete" | "lock" | "unlock" | null
  >(null);
  const { can } = useRBAC();
  const canUpdateClient = can(PERMISSIONS["clients:update"]);
  const portalStatus = (
    contact as CLIENT_BY_ID_QUERY_RESULT[number]["contacts"][number] & {
      appAccessStatus?: string;
    }
  ).appAccessStatus;
  const canLockPortalAccess =
    portalStatus === "active" || portalStatus === "invited";
  const canUnlockPortalAccess = portalStatus === "revoked";

  if (!canUpdateClient) {
    return null;
  }

  const handleOpenDialog = (dialogId: "edit" | "delete" | "lock" | "unlock") => {
    setOpenDialog(dialogId);
  };

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            onClick={() => handleOpenDialog("edit")}
          >
            <Pencil className="h-4 w-4 mr-2" />
            <span>Edit Contact</span>
          </DropdownMenuItem>
          {canLockPortalAccess && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-sm font-medium text-destructive focus:text-destructive"
                onClick={() => handleOpenDialog("lock")}
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
                onClick={() => handleOpenDialog("unlock")}
              >
                <Unlock className="h-4 w-4 mr-2" />
                <span>Unlock</span>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            onClick={() => {
              const contactsInProjects = contact.projects.length > 0;
              if (contactsInProjects) {
                toast.warning("This contact is used in 1 or more projects and cannot be deleted.");
              } else {
                handleOpenDialog("delete");
              }
            }}
          >
            <Trash className="h-4 w-4 mr-2 text-destructive" />
            <span>Delete Contact</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UpdateContactDialog
        contact={contact}
        open={openDialog === "edit"}
        onClose={handleCloseDialog}
      />
      <DeleteContactDialog
        contact={contact}
        open={openDialog === "delete"}
        onClose={handleCloseDialog}
      />
      <LockContactPortalDialog
        contact={contact}
        open={openDialog === "lock"}
        onClose={handleCloseDialog}
      />
      <UnlockContactPortalDialog
        contact={contact}
        open={openDialog === "unlock"}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
