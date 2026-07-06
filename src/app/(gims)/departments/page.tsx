import { Metadata } from "next";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { DepartmentsView } from "@/features/security/components/departments-view";

export const metadata: Metadata = {
  title: "Departments | GIMS",
  description: "Manage departments and job titles",
};

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  const session = await requirePermission(PERMISSIONS["security:read"]);

  return (
    <DepartmentsView
      canManage={session.permissions.includes(PERMISSIONS["security:manage"])}
    />
  );
}
