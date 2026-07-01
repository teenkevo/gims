import { Metadata } from "next";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { SecurityView } from "@/features/security/components/security-view";
import { getAuditLogs } from "@/sanity/lib/auth/getAuditLogs";
import {
  getPermissionMatrix,
  getPersonnelAccessOverview,
} from "@/lib/auth/security-data";

export const metadata: Metadata = {
  title: "Security | GIMS",
  description: "Departmental role permissions and audit logs",
};

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  await requirePermission(PERMISSIONS["security:read"]);

  const [auditLogs, permissionMatrix, personnelAccess] = await Promise.all([
    getAuditLogs(100),
    Promise.resolve(getPermissionMatrix()),
    getPersonnelAccessOverview(),
  ]);

  return (
    <SecurityView
      auditLogs={auditLogs}
      permissionMatrix={permissionMatrix}
      personnelAccess={personnelAccess}
    />
  );
}
