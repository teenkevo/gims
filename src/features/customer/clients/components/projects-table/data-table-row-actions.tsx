"use client";
import { CheckCircledIcon, CrossCircledIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
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
  ALL_TEST_METHODS_QUERYResult,
  ALL_SERVICES_QUERYResult,
} from "../../../../../../sanity.types";
import { useState } from "react";
import { EditServiceDialog } from "./row-actions/edit-service";
import { DeleteService } from "./row-actions/delete-service";
import { ActivateDeactivateService } from "./row-actions/activate-deactivate-service";
import { Delete, Pencil } from "lucide-react";

interface DataTableRowActionsProps<TData> {
  sampleClasses: ALL_SAMPLE_CLASSES_QUERYResult;
  testMethods: ALL_TEST_METHODS_QUERYResult;
  service?: ALL_SERVICES_QUERYResult[number];
}

export function DataTableRowActions<TData>({ sampleClasses, testMethods, service }: DataTableRowActionsProps<TData>) {
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
            <span>Edit Service</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            onClick={() => handleOpenDialog("dialog2")}
          >
            {service?.status === "active" ? (
              <CrossCircledIcon className=" h-4 w-4 mr-2" />
            ) : (
              <CheckCircledIcon className=" h-4 w-4 mr-2" />
            )}
            <span>{service?.status === "active" ? "Deactivate" : "Activate"}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            onClick={() => handleOpenDialog("dialog3")}
          >
            <Delete className="h-4 w-4 mr-2 text-destructive" />
            <span>Delete Service</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditServiceDialog
        sampleClasses={sampleClasses}
        testMethods={testMethods}
        service={service as ALL_SERVICES_QUERYResult[number]}
        open={openDialog === "dialog1"}
        onClose={handleCloseDialog}
      />
      <ActivateDeactivateService
        service={service as ALL_SERVICES_QUERYResult[number]}
        open={openDialog === "dialog2"}
        onClose={handleCloseDialog}
      />
      <DeleteService id={service?._id || ""} open={openDialog === "dialog3"} onClose={handleCloseDialog} />
    </div>
  );
}
