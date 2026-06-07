"use client";

import { useState } from "react";
import Link from "next/link";
import { Delete, MoreVertical, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ALL_LABS_QUERY_RESULT } from "../../../../../../sanity.types";
import { DeleteLabDialog } from "./row-actions/delete-lab-dialog";

export function LabTableRowActions({
  lab,
}: {
  lab: ALL_LABS_QUERY_RESULT[number];
}) {
  const [openDialog, setOpenDialog] = useState<"delete" | null>(null);

  const editHref = `/labs/${lab._id}`;

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem asChild>
            <Link
              href={editHref}
              className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            >
              <Pencil className="h-4 w-4 mr-2" />
              <span>View Lab</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-sm font-medium text-destructive focus:text-destructive"
            onClick={() => setOpenDialog("delete")}
          >
            <Delete className="h-4 w-4 mr-2" />
            <span>Delete Lab</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteLabDialog
        lab={lab}
        open={openDialog === "delete"}
        onClose={() => setOpenDialog(null)}
      />
    </div>
  );
}
