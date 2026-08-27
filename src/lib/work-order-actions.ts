"use server";

import { revalidateTag } from "next/cache";
import { writeClient } from "@/sanity/lib/write-client";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermissionOrError } from "@/lib/auth/with-auth";
import { emitNotification } from "@/features/internal/notifications/emit";

export async function createWorkOrder(input: {
  projectId: string;
  labId: string;
  notes?: string;
  send?: boolean;
}) {
  const denied = await requirePermissionOrError(PERMISSIONS["projects:update"]);
  if (denied) return { status: "error" as const, error: denied.error };

  const existing = await writeClient.fetch<{ _id: string } | null>(
    `*[_type == "workOrder" && references($projectId)][0]{ _id }`,
    { projectId: input.projectId }
  );

  const year = new Date().getFullYear();
  const workOrderId = existing?._id || `workOrder-${Date.now()}`;
  const status = input.send ? "sent" : "draft";
  const tx = writeClient.transaction();

  if (existing?._id) {
    tx.patch(existing._id, (p) =>
      p.set({
        lab: { _type: "reference", _ref: input.labId },
        notes: input.notes || "",
        status,
        ...(input.send ? { sentAt: new Date().toISOString() } : {}),
      })
    );
  } else {
    tx.create({
      _id: workOrderId,
      _type: "workOrder",
      project: { _type: "reference", _ref: input.projectId },
      lab: { _type: "reference", _ref: input.labId },
      workOrderNumber: `WO${year}-${Date.now().toString().slice(-6)}`,
      status,
      notes: input.notes || "",
      ...(input.send ? { sentAt: new Date().toISOString() } : {}),
    });
    tx.patch(input.projectId, (p) =>
      p.set({ workOrder: { _type: "reference", _ref: workOrderId } })
    );
  }

  await tx.commit({ autoGenerateArrayKeys: true });
  revalidateTag(`project-${input.projectId}`);

  if (input.send) {
    void emitNotification("work.order.issued", { projectId: input.projectId });
  } else if (!existing) {
    void emitNotification("work.order.created", { projectId: input.projectId });
  }

  return { status: "ok" as const, id: workOrderId };
}
