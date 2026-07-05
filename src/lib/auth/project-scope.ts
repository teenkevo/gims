import "server-only";

import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/client";
import {
  FORBIDDEN_ACTION_CODE,
  unauthorizedActionMessage,
  type ActionErrorResult,
} from "./action-errors";
import type { AuthContext } from "./types";
import { USER_TYPES } from "./user-type";
import { PERMISSIONS } from "./permissions";

type ProjectAccessRecord = {
  _id: string;
  contactPersons?: Array<{ _id: string } | null> | null;
};

const PROJECT_ACCESS_QUERY = defineQuery(`
  *[_type == "project" && _id == $projectId][0] {
    _id,
    contactPersons[]->{ _id }
  }
`);

const PROJECT_FOR_QUOTATION_QUERY = defineQuery(`
  *[_type == "project" && references($quotationId)][0] {
    _id,
    contactPersons[]->{ _id }
  }
`);

export function isClientSession(session: AuthContext): boolean {
  return session.userType === USER_TYPES.CLIENT;
}

export function contactHasProjectAccess(
  session: AuthContext,
  project: ProjectAccessRecord | null | undefined
): boolean {
  if (!project || !session.contactPersonId) return false;

  return (
    project.contactPersons?.some(
      (person) => person?._id === session.contactPersonId
    ) ?? false
  );
}

export async function getProjectForAccessCheck(
  projectId: string
): Promise<ProjectAccessRecord | null> {
  try {
    const project = await sanityFetch({
      query: PROJECT_ACCESS_QUERY,
      params: { projectId },
      revalidate: 0,
    });
    return project ?? null;
  } catch {
    return null;
  }
}

export async function getProjectForQuotationAccess(
  quotationId: string
): Promise<ProjectAccessRecord | null> {
  try {
    const project = await sanityFetch({
      query: PROJECT_FOR_QUOTATION_QUERY,
      params: { quotationId },
      revalidate: 0,
    });
    return project ?? null;
  } catch {
    return null;
  }
}

export async function requireProjectAccessOrError(
  session: AuthContext,
  projectId: string
): Promise<ActionErrorResult | null> {
  if (!isClientSession(session)) {
    return null;
  }

  if (!session.contactPersonId) {
    return {
      status: "error",
      error: unauthorizedActionMessage(PERMISSIONS["projects:read"]),
      code: FORBIDDEN_ACTION_CODE,
    };
  }

  const project = await getProjectForAccessCheck(projectId);

  if (!contactHasProjectAccess(session, project)) {
    return {
      status: "error",
      error: unauthorizedActionMessage(PERMISSIONS["projects:read"]),
      code: FORBIDDEN_ACTION_CODE,
    };
  }

  return null;
}

export async function requireQuotationProjectAccessOrError(
  session: AuthContext,
  quotationId: string
): Promise<ActionErrorResult | null> {
  if (!isClientSession(session)) {
    return null;
  }

  if (!session.contactPersonId) {
    return {
      status: "error",
      error: unauthorizedActionMessage(PERMISSIONS["projects:read"]),
      code: FORBIDDEN_ACTION_CODE,
    };
  }

  const project = await getProjectForQuotationAccess(quotationId);

  if (!contactHasProjectAccess(session, project)) {
    return {
      status: "error",
      error: unauthorizedActionMessage(PERMISSIONS["projects:read"]),
      code: FORBIDDEN_ACTION_CODE,
    };
  }

  return null;
}
