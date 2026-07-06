import "server-only";

import { revalidateTag } from "next/cache";
import { createClerkClient } from "@clerk/backend";
import { writeClient } from "@/sanity/lib/write-client";
import {
  lockClerkUser,
  resolveClerkUserId,
  unlockClerkUser,
} from "./clerk-users";
import { resolveClientPortalPermissions } from "./client-permissions";
import { createAuditLog } from "./audit-log";
import type { AuthContext } from "./types";
import { USER_TYPES } from "./user-type";

function getClerkClient() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) throw new Error("Missing CLERK_SECRET_KEY");
  return createClerkClient({ secretKey });
}

export async function inviteContactToPortal(params: {
  contactPersonId: string;
  email: string;
  fullName: string;
  clientId?: string;
  portalPermissions?: string[];
  invitedBy?: AuthContext;
  clerkUserId?: string | null;
}) {
  const {
    contactPersonId,
    email,
    fullName,
    clientId,
    portalPermissions,
    invitedBy,
    clerkUserId,
  } = params;

  const permissions = resolveClientPortalPermissions(portalPermissions);
  const clerk = getClerkClient();

  const resolvedClerkUserId = await resolveClerkUserId(email, clerkUserId);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const signUpPath = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";

  try {
    await clerk.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `${baseUrl}${signUpPath}`,
      publicMetadata: {
        userType: USER_TYPES.CLIENT,
      },
      ignoreExisting: true,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Invitation failed";
    if (!message.toLowerCase().includes("already")) {
      throw error;
    }
  }

  await writeClient
    .patch(contactPersonId)
    .set({
      appAccessStatus: "invited",
      portalPermissions: permissions,
      ...(resolvedClerkUserId ? { clerkUserId: resolvedClerkUserId } : {}),
    })
    .commit();

  const existing = await writeClient.fetch<{ _id: string } | null>(
    `*[_type == "appUser" && lower(email) == lower($email)][0]{ _id }`,
    { email }
  );

  const appUserPayload = {
    email,
    userType: USER_TYPES.CLIENT,
    permissions,
    isActive: true,
    contactPerson: { _type: "reference", _ref: contactPersonId },
    ...(clientId
      ? { client: { _type: "reference", _ref: clientId } }
      : {}),
    assignedBy: invitedBy?.userId,
    assignedAt: new Date().toISOString(),
    ...(resolvedClerkUserId ? { clerkUserId: resolvedClerkUserId } : {}),
  };

  if (existing?._id) {
    await writeClient.patch(existing._id).set(appUserPayload).commit();
  } else {
    await writeClient.create({
      _type: "appUser",
      clerkUserId: resolvedClerkUserId ?? "",
      ...appUserPayload,
    });
  }

  if (invitedBy) {
    await createAuditLog(invitedBy, {
      action: "contact_invited",
      resource: "contactPerson",
      resourceId: contactPersonId,
      metadata: { email, fullName },
    });
  }
}

export async function linkClerkUserToContact(
  contactPersonId: string,
  clerkUserId: string,
  email: string
) {
  await writeClient
    .patch(contactPersonId)
    .set({
      clerkUserId,
      appAccessStatus: "active",
    })
    .commit();

  const contact = await writeClient.fetch<{
    client?: { _id: string } | null;
  } | null>(
    `*[_type == "contactPerson" && _id == $contactPersonId][0]{
      client->{ _id }
    }`,
    { contactPersonId }
  );

  revalidateTag("contactPerson");

  if (contact?.client?._id) {
    revalidateTag(`client-${contact.client._id}`);
  }

  const projectIds = await writeClient.fetch<string[]>(
    `*[_type == "project" && references($contactPersonId)]._id`,
    { contactPersonId }
  );
  for (const projectId of projectIds) {
    revalidateTag(`project-${projectId}`);
  }

  const existing = await writeClient.fetch<{ _id: string } | null>(
    `*[_type == "appUser" && lower(email) == lower($email)][0]{ _id }`,
    { email }
  );

  if (existing?._id) {
    await writeClient
      .patch(existing._id)
      .set({
        clerkUserId,
        isActive: true,
      })
      .commit();
  }
}

export async function lockContactPortalAccess(params: {
  contactPersonId: string;
  email: string;
  clerkUserId?: string | null;
  lockedBy?: AuthContext;
}) {
  const { contactPersonId, email, clerkUserId, lockedBy } = params;

  const resolvedClerkUserId = await resolveClerkUserId(email, clerkUserId);
  if (resolvedClerkUserId) {
    await lockClerkUser(resolvedClerkUserId);
  }

  await writeClient
    .patch(contactPersonId)
    .set({
      appAccessStatus: "revoked",
      ...(resolvedClerkUserId ? { clerkUserId: resolvedClerkUserId } : {}),
    })
    .commit();

  const appUser = await writeClient.fetch<{ _id: string } | null>(
    `*[_type == "appUser" && lower(email) == lower($email)][0]{ _id }`,
    { email }
  );

  if (appUser?._id) {
    await writeClient
      .patch(appUser._id)
      .set({
        isActive: false,
        ...(resolvedClerkUserId ? { clerkUserId: resolvedClerkUserId } : {}),
      })
      .commit();
  }

  if (lockedBy) {
    await createAuditLog(lockedBy, {
      action: "role_revoked",
      resource: "contactPerson",
      resourceId: contactPersonId,
      metadata: { email, clerkUserId: resolvedClerkUserId },
    });
  }
}

/** @deprecated Use lockContactPortalAccess */
export const revokeContactPortalAccess = lockContactPortalAccess;

export async function unlockContactPortalAccess(params: {
  contactPersonId: string;
  email: string;
  clerkUserId?: string | null;
  unlockedBy?: AuthContext;
}) {
  const { contactPersonId, email, clerkUserId, unlockedBy } = params;

  const resolvedClerkUserId = await resolveClerkUserId(email, clerkUserId);
  if (resolvedClerkUserId) {
    await unlockClerkUser(resolvedClerkUserId);
  }

  const nextAccessStatus = resolvedClerkUserId ? "active" : "invited";

  await writeClient
    .patch(contactPersonId)
    .set({
      appAccessStatus: nextAccessStatus,
      ...(resolvedClerkUserId ? { clerkUserId: resolvedClerkUserId } : {}),
    })
    .commit();

  const appUser = await writeClient.fetch<{ _id: string } | null>(
    `*[_type == "appUser" && lower(email) == lower($email)][0]{ _id }`,
    { email }
  );

  if (appUser?._id) {
    await writeClient
      .patch(appUser._id)
      .set({
        isActive: true,
        ...(resolvedClerkUserId ? { clerkUserId: resolvedClerkUserId } : {}),
      })
      .commit();
  }

  if (unlockedBy) {
    await createAuditLog(unlockedBy, {
      action: "role_assigned",
      resource: "contactPerson",
      resourceId: contactPersonId,
      metadata: { email, clerkUserId: resolvedClerkUserId },
    });
  }
}
