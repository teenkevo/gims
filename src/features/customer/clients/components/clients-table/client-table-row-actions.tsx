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
import type { ALL_CLIENTS_QUERY_RESULT } from "../../../../../../sanity.types";
import { DeleteClientDialog } from "./row-actions/delete-client-dialog";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useRBAC } from "@/components/rbac-context";

export function ClientTableRowActions({
  client,
}: {
  client: ALL_CLIENTS_QUERY_RESULT[number];
}) {
  const [openDialog, setOpenDialog] = useState<"delete" | null>(null);
  const { can } = useRBAC();
  const canUpdate = can(PERMISSIONS["clients:update"]);
  const canDelete = can(PERMISSIONS["clients:delete"]);

  if (!canUpdate && !canDelete) {
    return null;
  }

  const editHref = `/clients/${client._id}?client=${client.name}`;

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
          {canUpdate && (
            <DropdownMenuItem asChild>
              <Link
                href={editHref}
                className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
              >
                <Pencil className="h-4 w-4 mr-2" />
                <span>Edit Client</span>
              </Link>
            </DropdownMenuItem>
          )}
          {canUpdate && canDelete && <DropdownMenuSeparator />}
          {canDelete && (
            <DropdownMenuItem
              className="cursor-pointer text-sm font-medium text-destructive focus:text-destructive"
              onClick={() => setOpenDialog("delete")}
            >
              <Delete className="h-4 w-4 mr-2" />
              <span>Delete Client</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteClientDialog
        client={client}
        open={openDialog === "delete"}
        onClose={() => setOpenDialog(null)}
      />
    </div>
  );
}
