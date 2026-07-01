"use server";

import { getAuditLogs } from "@/sanity/lib/auth/getAuditLogs";
import { getAllAppRoles } from "@/sanity/lib/auth/getAllAppRoles";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { getPersonnelAccessOverview } from "@/lib/auth/security-data";
import { getSecurityDepartments } from "@/sanity/lib/departments/getSecurityDepartments";
import {
  getDepartmentDetail,
  getDepartmentEditorData,
  getPersonnelPickerOptions,
} from "@/sanity/lib/departments/getDepartmentDetail";

export async function fetchSecurityRoles() {
  await requirePermission(PERMISSIONS["security:read"]);
  return getAllAppRoles();
}

export async function fetchSecurityUsers() {
  await requirePermission(PERMISSIONS["security:read"]);
  return getPersonnelAccessOverview();
}

export async function fetchSecurityAuditLogs() {
  await requirePermission(PERMISSIONS["security:read"]);
  return getAuditLogs(100);
}

export async function fetchSecurityDepartments() {
  await requirePermission(PERMISSIONS["security:read"]);
  return getSecurityDepartments();
}

export async function fetchDepartmentDetail(departmentId: string) {
  await requirePermission(PERMISSIONS["security:read"]);
  return getDepartmentDetail(departmentId);
}

export async function fetchDepartmentEditorData(departmentId: string) {
  await requirePermission(PERMISSIONS["security:read"]);
  return getDepartmentEditorData(departmentId);
}

export async function fetchPersonnelPickerOptions(departmentId?: string) {
  await requirePermission(PERMISSIONS["security:read"]);
  return getPersonnelPickerOptions(departmentId);
}

export async function fetchAdministrationDepartmentRoles() {
  await requirePermission(PERMISSIONS["security:read"]);
  return getAdministrationDepartmentRoles();
}
