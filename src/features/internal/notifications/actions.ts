"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { writeClient } from "@/sanity/lib/write-client";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermissionOrError } from "@/lib/auth/with-auth";
import {
  isNotificationEventType,
  notificationSubscriptionId,
  type NotificationEventType,
} from "./events";

type ActionResult = { status: "ok" } | { status: "error"; error: string };

function ok(): ActionResult {
  return { status: "ok" };
}

function fail(error: string): ActionResult {
  return { status: "error", error };
}

async function upsertSubscription(input: {
  eventType: NotificationEventType;
  departmentIds: string[];
  enabled: boolean;
}) {
  const existing = await writeClient.fetch<string | null>(
    `*[_type == "notificationSubscription" && eventType == $eventType][0]._id`,
    { eventType: input.eventType }
  );

  const documentId = existing ?? notificationSubscriptionId(input.eventType);
  const departmentIds = [...new Set(input.departmentIds.filter(Boolean))];

  await writeClient.createOrReplace({
    _id: documentId,
    _type: "notificationSubscription",
    eventType: input.eventType,
    enabled: input.enabled,
    departments: departmentIds.map((id) => ({
      _type: "reference" as const,
      _ref: id,
      _key: id,
    })),
  });
}

export async function saveNotificationSubscription(input: {
  eventType: NotificationEventType;
  departmentIds: string[];
  enabled: boolean;
}): Promise<ActionResult> {
  const denied = await requirePermissionOrError(
    PERMISSIONS["notifications:manage"]
  );
  if (denied) return fail(denied.error);

  if (!isNotificationEventType(input.eventType)) {
    return fail("Unknown notification event.");
  }

  await upsertSubscription(input);
  revalidateTag("notifications");
  revalidatePath("/notifications");
  return ok();
}
