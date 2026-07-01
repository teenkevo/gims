import "server-only";

import { createClerkClient } from "@clerk/backend";
import { writeClient } from "@/sanity/lib/write-client";
import { createAuditLog } from "./audit-log";
import type { AuthContext } from "./types";
import { USER_TYPES } from "./user-type";

function getClerkClient() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) throw new Error("Missing CLERK_SECRET_KEY");
  return createClerkClient({ secretKey });
}

export async function invitePersonnelToApp(params: {
  personnelId: string;
  email: string;
  fullName: string;
  invitedBy?: AuthContext;
}) {
  const { personnelId, email, fullName, invitedBy } = params;
  const clerk = getClerkClient();

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const signUpPath =
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";

  try {
    await clerk.invitations.createInvitation({
      emailAddress: email,
      // Invited users must land on sign-up to consume __clerk_ticket and set a password.
      redirectUrl: `${baseUrl}${signUpPath}`,
      publicMetadata: {
        userType: USER_TYPES.INTERNAL,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Invitation failed";
    if (!message.toLowerCase().includes("already")) {
      throw error;
    }
  }

  await writeClient
    .patch(personnelId)
    .set({
      appAccessStatus: "invited",
    })
    .commit();

  const existing = await writeClient.fetch<{ _id: string } | null>(
    `*[_type == "appUser" && lower(email) == lower($email)][0]{ _id }`,
    { email }
  );

  if (existing?._id) {
    await writeClient
      .patch(existing._id)
      .set({
        email,
        userType: USER_TYPES.INTERNAL,
        personnel: { _type: "reference", _ref: personnelId },
        isActive: true,
        assignedBy: invitedBy?.userId,
        assignedAt: new Date().toISOString(),
      })
      .commit();
  } else {
    await writeClient.create({
      _type: "appUser",
      clerkUserId: "",
      email,
      userType: USER_TYPES.INTERNAL,
      personnel: { _type: "reference", _ref: personnelId },
      isActive: true,
      assignedBy: invitedBy?.userId,
      assignedAt: new Date().toISOString(),
    });
  }

  if (invitedBy) {
    await createAuditLog(invitedBy, {
      action: "personnel_invited",
      resource: "personnel",
      resourceId: personnelId,
      metadata: { email, fullName },
    });
  }
}

export async function linkClerkUserToPersonnel(
  personnelId: string,
  clerkUserId: string
) {
  await writeClient
    .patch(personnelId)
    .set({
      clerkUserId,
      appAccessStatus: "active",
    })
    .commit();
}
