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
  contactPersonId?: string;
  clientId?: string;
  clientName?: string;
  departmentRoles: DepartmentRoleAssignment[];
};

const ACCESS_CACHE_KEY = "gims-rbac-access";

function readAccessCache(): AccessState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(ACCESS_CACHE_KEY);
    return raw ? (JSON.parse(raw) as AccessState) : null;
  } catch {
    return null;
  }
}

function writeAccessCache(access: AccessState) {
  try {
    sessionStorage.setItem(ACCESS_CACHE_KEY, JSON.stringify(access));
  } catch {
    // Ignore quota / private mode errors.
  }
}

function clearAccessCache() {
  try {
    sessionStorage.removeItem(ACCESS_CACHE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

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
  const [cacheHydrated, setCacheHydrated] = useState(false);

  useEffect(() => {
    const cached = readAccessCache();
    if (cached) {
      setAccess((current) => current ?? cached);
    }
    setCacheHydrated(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      setAccess(null);
      clearAccessCache();
      return;
    }

    let cancelled = false;

    getMyAccess(user.emailAddresses[0]?.emailAddress).then((resolved) => {
      if (cancelled) return;

      if (resolved) {
        const nextAccess: AccessState = {
          userId: resolved.userId,
          user: {
            ...resolved.user,
            imageUrl: user.imageUrl ?? resolved.user.imageUrl,
          },
          role: resolved.role,
          permissions: resolved.permissions,
          userType: resolved.userType,
          accessLabel: resolved.accessLabel,
          contactPersonId: resolved.contactPersonId,
          clientId: resolved.clientId,
          clientName: resolved.clientName,
          departmentRoles: resolved.departmentRoles,
        };
        writeAccessCache(nextAccess);
        setAccess(nextAccess);
      } else {
        const pendingAccess: AccessState = {
          userId: user.id,
          user: clerkUserToAuthUser(user),
          role: "viewer",
          permissions: [],
          userType: "pending",
          accessLabel: "Pending HR approval",
          departmentRoles: [],
        };
        writeAccessCache(pendingAccess);
        setAccess(pendingAccess);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, user?.id, user?.imageUrl]);

  const isAccessLoading =
    isLoaded && Boolean(user) && cacheHydrated && access === null;

  if (!isLoaded || !user) {
    return (
      <RBACProvider isAccessLoading={!isLoaded}>{children}</RBACProvider>
    );
  }

  if (!access) {
    return (
      <RBACProvider isAccessLoading={isAccessLoading}>{children}</RBACProvider>
    );
  }

  return (
    <RBACProvider
      userId={access.userId}
      user={access.user}
      role={access.role}
      permissions={access.permissions}
      userType={access.userType}
      accessLabel={access.accessLabel}
      contactPersonId={access.contactPersonId}
      clientId={access.clientId}
      clientName={access.clientName}
      departmentRoles={access.departmentRoles}
      isAccessLoading={false}
    >
      {children}
    </RBACProvider>
  );
}
