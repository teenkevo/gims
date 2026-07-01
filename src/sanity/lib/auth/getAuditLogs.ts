import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

export type AuditLogEntry = {
  _id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  userEmail: string;
  userRole: string;
  metadata?: string;
  timestamp: string;
};

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

export async function getAuditLogs(limit = 50): Promise<AuditLogEntry[]> {
  return client.fetch<AuditLogEntry[]>(
    `*[_type == "auditLog"] | order(timestamp desc) [0...$limit] {
      _id,
      action,
      resource,
      resourceId,
      userId,
      userEmail,
      userRole,
      metadata,
      timestamp
    }`,
    { limit }
  );
}
