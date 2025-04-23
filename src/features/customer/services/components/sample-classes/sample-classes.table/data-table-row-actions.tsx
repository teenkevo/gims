"use client";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  ALL_SAMPLE_CLASSES_QUERYResult,
  ALL_STANDARDS_QUERYResult,
} from "../../../../../../../sanity.types";
import { useState } from "react";
import { EditSampleClassDialog } from "./row-actions/edit-sample-class";
import { DeleteSampleClass } from "./row-actions/delete-sample-class";
import { Delete, Pencil } from "lucide-react";
import { getDocumentsReferencingSampleClass } from "@/lib/actions";

interface DataTableRowActionsProps<TData> {
  sampleClass: ALL_SAMPLE_CLASSES_QUERYResult[number];
}

export function DataTableRowActions<TData>({
  sampleClass,
}: DataTableRowActionsProps<TData>) {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const [referencingDocs, setReferencingDocs] = useState([]);

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
          <Button
            variant="outline"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            onClick={() => handleOpenDialog("dialog1")}
          >
            <Pencil className="h-4 w-4 mr-2" />
            <span>Edit Sample Class</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            onClick={async () => {
              const docs = await getDocumentsReferencingSampleClass(
                sampleClass._id
              );
              setReferencingDocs(docs);
              handleOpenDialog("dialog2");
            }}
          >
            <Delete className="h-4 w-4 mr-2 text-destructive" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditSampleClassDialog
        sampleClass={sampleClass}
        open={openDialog === "dialog1"}
        onClose={handleCloseDialog}
      />
      <DeleteSampleClass
        sampleClass={sampleClass}
        open={openDialog === "dialog2"}
        onClose={handleCloseDialog}
        referencingDocs={referencingDocs}
      />
    </div>
  );
}
