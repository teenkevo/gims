import { redirect } from "next/navigation";
import type { Permission } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";

interface RequirePermissionProps {
  permission: Permission;
  children: React.ReactNode;
}

/**
 * Server component guard for page-level permission checks.
 */
export async function RequirePermission({
  permission,
  children,
}: RequirePermissionProps) {
  try {
    await requirePermission(permission);
    return <>{children}</>;
  } catch {
    redirect("/projects");
  }
}
