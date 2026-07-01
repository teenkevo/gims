import "server-only";

import { writeClient } from "@/sanity/lib/write-client";
import type { AuditLogInput, AuthContext } from "./types";

export async function createAuditLog(
  session: AuthContext,
  input: AuditLogInput
): Promise<void> {
  try {
    await writeClient.create({
      _type: "auditLog",
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId,
      userId: session.userId,
      userEmail: session.user.email,
      userRole: session.role,
      metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[audit-log] Failed to write audit log:", error);
  }
}

export async function logPermissionDenied(
  session: AuthContext,
  permission: string,
  resource: string,
  resourceId?: string
): Promise<void> {
  await createAuditLog(session, {
    action: "permission_denied",
    resource,
    resourceId,
    metadata: { permission },
  });
}
