"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { RBACProvider } from "@/components/rbac-context";
import { getMyAccess } from "@/lib/auth/get-my-access";
import type { Permission } from "@/lib/auth/permissions";
import type { Role } from "@/lib/auth/roles";
import type { UserType } from "@/lib/auth/user-type";
import type { AuthUser } from "@/lib/auth/types";
import type { DepartmentRoleAssignment } from "@/lib/auth/department-role-permissions";

type AccessState = {
  userId: string;
  user: AuthUser;
  role: Role;
  permissions: Permission[];
  userType: UserType;
  accessLabel: string;
  departmentRoles: DepartmentRoleAssignment[];
};

function clerkUserToAuthUser(
  user: NonNullable<ReturnType<typeof useUser>["user"]>
): AuthUser {
  const firstName = user.firstName ?? null;
  const lastName = user.lastName ?? null;

  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress ?? "",
    firstName,
    lastName,
    fullName:
      user.fullName ||
      [firstName, lastName].filter(Boolean).join(" ") ||
      user.emailAddresses[0]?.emailAddress ||
      "User",
    imageUrl: user.imageUrl ?? null,
  };
}

export function AuthRBACProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [access, setAccess] = useState<AccessState | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) {
      setAccess(null);
      return;
    }

    let cancelled = false;

    getMyAccess(user.emailAddresses[0]?.emailAddress).then((resolved) => {
      if (cancelled) return;

      if (resolved) {
        setAccess({
          userId: resolved.userId,
          user: {
            ...resolved.user,
            imageUrl: user.imageUrl ?? resolved.user.imageUrl,
          },
          role: resolved.role,
          permissions: resolved.permissions,
          userType: resolved.userType,
          accessLabel: resolved.accessLabel,
          departmentRoles: resolved.departmentRoles,
        });
      } else {
        setAccess({
          userId: user.id,
          user: clerkUserToAuthUser(user),
          role: "viewer",
          permissions: [],
          userType: "pending",
          accessLabel: "Pending HR approval",
          departmentRoles: [],
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, user?.id]);

  if (!isLoaded || !user) {
    return <RBACProvider>{children}</RBACProvider>;
  }

  if (!access) {
    return <RBACProvider>{children}</RBACProvider>;
  }

  return (
    <RBACProvider
      userId={access.userId}
      user={access.user}
      role={access.role}
      permissions={access.permissions}
      userType={access.userType}
      accessLabel={access.accessLabel}
      departmentRoles={access.departmentRoles}
    >
      {children}
    </RBACProvider>
  );
}
