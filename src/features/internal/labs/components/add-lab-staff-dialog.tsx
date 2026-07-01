"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, PlusCircleIcon } from "lucide-react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ALL_PERSONNEL_QUERY_RESULT } from "../../../../../sanity.types";
import { addLabStaff } from "@/lib/actions";

export function AddLabStaffDialog({
  labId,
  availablePersonnel,
  disabled = false,
}: {
  labId: string;
  availablePersonnel: ALL_PERSONNEL_QUERY_RESULT;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const pendingOptions = useMemo(
    () =>
      availablePersonnel.filter((person) => pendingIds.includes(person._id)),
    [availablePersonnel, pendingIds]
  );

  const toggle = (id: string) => {
    setPendingIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setPendingIds([]);
    }
  };

  const handleAdd = () => {
    if (pendingIds.length === 0) return;

    startTransition(async () => {
      const result = await addLabStaff(labId, pendingIds);
      if (result.status === "ok") {
        toast.success(
          `${pendingIds.length} staff member${pendingIds.length !== 1 ? "s" : ""} added to laboratory`
        );
        setPendingIds([]);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(
          typeof result.error === "string" ? result.error : "Something went wrong"
        );
      }
    });
  };

  return (
    <Dialog loading={isPending} open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          className="h-8"
          disabled={disabled || availablePersonnel.length === 0}
        >
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Add staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add staff to laboratory</DialogTitle>
          <DialogDescription>
            Search and select personnel to assign to this laboratory.
          </DialogDescription>
        </DialogHeader>

        <Command className="rounded-lg border">
          <CommandInput placeholder="Search personnel..." />
          <CommandList className="max-h-64">
            <CommandEmpty>No available personnel found.</CommandEmpty>
            <CommandGroup>
              {availablePersonnel.map((person) => (
                <CommandItem
                  key={person._id}
                  value={`${person.fullName ?? ""} ${person.internalId ?? ""}`}
                  onSelect={() => toggle(person._id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      pendingIds.includes(person._id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{person.fullName ?? "Unknown"}</span>
                    <span className="text-xs text-muted-foreground">
                      {person.internalId}
                      {person.departmentRoles?.[0]?.role
                        ? ` · ${person.departmentRoles[0].role}`
                        : ""}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>

        {pendingOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pendingOptions.map((person) => (
              <Badge key={person._id} variant="secondary">
                {person.fullName ?? person.internalId}
              </Badge>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={pendingIds.length === 0 || isPending}
          >
            {isPending ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>Add {pendingIds.length > 0 ? `(${pendingIds.length})` : ""}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
