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
import type { ALL_SERVICES_QUERY_RESULT } from "../../../../../sanity.types";
import { addLabTestCapabilities } from "@/lib/actions";

export function AddLabTestCapabilitiesDialog({
  labId,
  availableServices,
  disabled = false,
}: {
  labId: string;
  availableServices: ALL_SERVICES_QUERY_RESULT;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const pendingItems = useMemo(
    () => availableServices.filter((item) => pendingIds.includes(item._id)),
    [availableServices, pendingIds]
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
    if (!nextOpen) setPendingIds([]);
  };

  const handleAdd = () => {
    if (pendingIds.length === 0) return;

    startTransition(async () => {
      const result = await addLabTestCapabilities(labId, pendingIds);
      if (result.status === "ok") {
        toast.success(
          `${pendingIds.length} test capabilit${pendingIds.length !== 1 ? "ies" : "y"} added to laboratory`
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          className="h-8"
          disabled={disabled || availableServices.length === 0}
        >
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Add test capabilities
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add test capabilities</DialogTitle>
          <DialogDescription>
            Search and select accredited test methods for this laboratory.
          </DialogDescription>
        </DialogHeader>

        <Command className="rounded-lg border">
          <CommandInput placeholder="Search test capabilities..." />
          <CommandList className="max-h-64">
            <CommandEmpty>No available test capabilities found.</CommandEmpty>
            <CommandGroup>
              {availableServices.map((item) => (
                <CommandItem
                  key={item._id}
                  value={`${item.testParameter ?? ""} ${item.code ?? ""}`}
                  onSelect={() => toggle(item._id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      pendingIds.includes(item._id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{item.testParameter ?? "Unknown"}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.code ?? "—"}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>

        {pendingItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pendingItems.map((item) => (
              <Badge key={item._id} variant="secondary">
                {item.code ?? item.testParameter}
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
