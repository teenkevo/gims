import { Metadata } from "next";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { SecurityView } from "@/features/security/components/security-view";

export const metadata: Metadata = {
  title: "Security | GIMS",
  description: "Role permissions and audit logs",
};

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const session = await requirePermission(PERMISSIONS["security:read"]);

  return (
    <SecurityView
      canManageRoles={session.permissions.includes(
        PERMISSIONS["security:manage"]
      )}
    />
  );
}
