"use client";

import React, { createContext, useContext, ReactNode, useMemo } from "react";
import type { Permission } from "@/lib/auth/permissions";
import type { Role } from "@/lib/auth/roles";
import { DEFAULT_ROLE } from "@/lib/auth/roles";
import type { UserType } from "@/lib/auth/user-type";
import { USER_TYPES } from "@/lib/auth/user-type";
import type { DepartmentRoleAssignment } from "@/lib/auth/department-role-permissions";
import type { AuthUser, SessionContext } from "@/lib/auth/types";
import { can, hasRole } from "@/lib/auth/authorize";

export interface RBACValue {
  userId: string | null;
  user: AuthUser | null;
  role: Role;
  permissions: Permission[];
  userType: UserType | null;
  accessLabel: string | null;
  departmentRoles: DepartmentRoleAssignment[];
  isAuthenticated: boolean;
  setRole: (role: Role) => void;
  can: (permission: Permission) => boolean;
  hasRole: (role: Role) => boolean;
  isInternalUser: boolean;
  isClientUser: boolean;
}

const RBACContext = createContext<RBACValue | undefined>(undefined);

interface RBACProviderProps {
  children: ReactNode;
  userId?: string | null;
  user?: AuthUser | null;
  role?: Role | null;
  permissions?: Permission[];
  userType?: UserType | null;
  accessLabel?: string | null;
  departmentRoles?: DepartmentRoleAssignment[];
}

export const RBACProvider = ({
  children,
  userId = null,
  user = null,
  role = null,
  permissions = [],
  userType = null,
  accessLabel = null,
  departmentRoles = [],
}: RBACProviderProps) => {
  const isAuthenticated = Boolean(userId);
  const resolvedRole = role ?? DEFAULT_ROLE;

  const session = useMemo<SessionContext>(
    () =>
      isAuthenticated && user
        ? {
            userId: userId!,
            user,
            role: resolvedRole,
            permissions,
            userType: userType ?? USER_TYPES.PENDING,
            accessLabel: accessLabel ?? "",
            personnelId: undefined,
            contactPersonId: undefined,
            clientId: undefined,
            departmentRoles,
            isAuthenticated: true,
          }
        : {
            userId: null,
            user: null,
            role: null,
            permissions: [],
            userType: null,
            accessLabel: null,
            personnelId: undefined,
            contactPersonId: undefined,
            clientId: undefined,
            departmentRoles: [],
            isAuthenticated: false,
          },
    [
      isAuthenticated,
      userId,
      user,
      resolvedRole,
      permissions,
      userType,
      accessLabel,
      departmentRoles,
    ]
  );

  const value = useMemo<RBACValue>(
    () => ({
      userId: session.userId,
      user: session.user,
      role: resolvedRole,
      permissions: session.isAuthenticated ? session.permissions : [],
      userType: session.isAuthenticated ? session.userType : null,
      accessLabel: session.isAuthenticated ? session.accessLabel : null,
      departmentRoles: session.isAuthenticated ? session.departmentRoles : [],
      isAuthenticated: session.isAuthenticated,
      setRole: () => {},
      can: (permission) => can(session, permission),
      hasRole: (checkRole) => hasRole(session, checkRole),
      isInternalUser:
        session.isAuthenticated &&
        session.userType === USER_TYPES.INTERNAL,
      isClientUser:
        session.isAuthenticated && session.userType === USER_TYPES.CLIENT,
    }),
    [session, resolvedRole]
  );

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
};

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error("useRBAC must be used within an RBACProvider");
  }
  return context;
};

export function useAppRole() {
  const { role } = useRBAC();
  return role;
}
