"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createWorkOrder } from "@/lib/work-order-actions";
import type { PROJECT_BY_ID_QUERY_RESULT } from "../../../../../sanity.types";
import type { ALL_LABS_QUERY_RESULT } from "../../../../../sanity.types";

export function WorkOrderPanel({
  project,
  labs,
  canCreate,
}: {
  project: PROJECT_BY_ID_QUERY_RESULT[number];
  labs: ALL_LABS_QUERY_RESULT;
  canCreate: boolean;
}) {
  const existing = project.workOrder;
  const [labId, setLabId] = useState(existing?.lab?._id || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [pending, startTransition] = useTransition();

  const handleSave = (send: boolean) => {
    if (!labId) {
      toast.error("Select a laboratory");
      return;
    }
    startTransition(async () => {
      const result = await createWorkOrder({
        projectId: project._id,
        labId,
        notes,
        send,
      });
      if (result.status === "ok") {
        toast.success(send ? "Work order sent" : "Work order saved");
        window.location.reload();
      } else {
        toast.error("Failed to save work order");
      }
    });
  };

  return (
    <div className="rounded-lg border bg-gradient-to-b from-muted/20 to-muted/40 p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Work Order</h3>
          <p className="text-sm text-muted-foreground">
            Assign execution to a laboratory after sample receipt is complete.
          </p>
        </div>
        {existing?.status && (
          <Badge variant="secondary" className="capitalize">
            {existing.status}
          </Badge>
        )}
      </div>

      {existing?.workOrderNumber && (
        <p className="text-sm">
          <span className="text-muted-foreground">Number: </span>
          {existing.workOrderNumber}
        </p>
      )}

      <div className="space-y-2">
        <Label>Laboratory</Label>
        <Select
          value={labId}
          onValueChange={setLabId}
          disabled={!canCreate || existing?.status === "sent"}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select lab" />
          </SelectTrigger>
          <SelectContent>
            {labs.map((lab) => (
              <SelectItem key={lab._id} value={lab._id}>
                {lab.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          disabled={!canCreate || existing?.status === "sent"}
        />
      </div>

      {canCreate && existing?.status !== "sent" && (
        <div className="flex flex-wrap gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => handleSave(false)}
          >
            Save draft
          </Button>
          <Button
            type="button"
            disabled={pending}
            onClick={() => handleSave(true)}
          >
            {pending ? "Sending..." : "Send to lab"}
          </Button>
        </div>
      )}
    </div>
  );
}
