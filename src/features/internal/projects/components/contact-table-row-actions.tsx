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
import type { ALL_CONTACTS_QUERYResult } from "../../../../../sanity.types";
import { useState } from "react";
import { Pencil, Trash } from "lucide-react";
import { UpdateContactDialog } from "./update-contact-dialog";
import { RemoveContactFromProject } from "./remove-contact-from-project";

interface ContactTableRowActionsProps {
  contact: ALL_CONTACTS_QUERYResult[number];
  projectId: string;
}

export function ContactTableRowActions({
  contact,
  projectId,
}: ContactTableRowActionsProps) {
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);

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
            onClick={() => setOpenUpdate(true)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            <span>Edit Contact</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            onClick={() => setOpenRemove(true)}
          >
            <Trash className="h-4 w-4 mr-2 text-destructive" />
            <span>Remove from Project</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UpdateContactDialog
        contact={contact}
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
      />
      <RemoveContactFromProject
        email={contact.email!}
        projectId={projectId}
        contactId={contact._id}
        open={openRemove}
        onClose={() => setOpenRemove(false)}
      />
    </div>
  );
}
