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
import type { CLIENT_BY_ID_QUERYResult } from "../../../../../../sanity.types";
import { useState } from "react";
import { Delete, Pencil, Trash } from "lucide-react";
import { UpdateContactDialog } from "./row-actions/update-contact-dialog";
import { DeleteContactDialog } from "./row-actions/delete-contact-dialog";
import { toast } from "sonner";

interface DataTableRowActionsProps<TData> {
  contact: CLIENT_BY_ID_QUERYResult[number]["contacts"][number];
}

export function DataTableRowActions<TData>({ contact }: DataTableRowActionsProps<TData>) {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const handleOpenDialog = (dialogId: string) => {
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
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            onClick={() => handleOpenDialog("dialog1")}
          >
            <Pencil className="h-4 w-4 mr-2" />
            <span>Edit Contact</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            onClick={() => {
              const contactsInProjects = contact.projects.length > 0;
              if (contactsInProjects) {
                toast.warning("This contact is used in 1 or more projects and cannot be deleted.");
              } else {
                handleOpenDialog("dialog2");
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
        open={openDialog === "dialog1"}
        onClose={handleCloseDialog}
      />
      <DeleteContactDialog
        contact={contact}
        open={openDialog === "dialog2"}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
