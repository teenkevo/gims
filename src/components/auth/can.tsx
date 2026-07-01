"use client";

import type { Permission } from "@/lib/auth/permissions";
import { useRBAC } from "@/components/rbac-context";

interface CanProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/** Conditionally render children when the current user has a permission. */
export function Can({ permission, children, fallback = null }: CanProps) {
  const { can } = useRBAC();
  return can(permission) ? <>{children}</> : <>{fallback}</>;
}
