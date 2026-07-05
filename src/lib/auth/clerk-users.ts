import "server-only";

import { cache } from "react";
import { createClerkClient } from "@clerk/backend";

export type ClerkUserSummary = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  imageUrl: string;
};

function getClerkBackendClient() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing CLERK_SECRET_KEY");
  }
  return createClerkClient({ secretKey });
}

async function fetchClerkUsersFromApi(): Promise<ClerkUserSummary[]> {
  const client = getClerkBackendClient();
  const { data } = await client.users.getUserList({ limit: 100 });

  return data.map((user) => ({
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress ?? "",
    fullName:
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      "Unknown",
    role: (user.publicMetadata?.role as string) ?? "viewer",
    imageUrl: user.imageUrl,
  }));
}

/** Always fetches the latest user list from Clerk. Deduped within a single request only. */
export const getClerkUsersList = cache(fetchClerkUsersFromApi);

export async function findClerkUserIdByEmail(
  email: string
): Promise<string | null> {
  const client = getClerkBackendClient();
  const { data } = await client.users.getUserList({
    emailAddress: [email],
    limit: 1,
  });

  return data[0]?.id ?? null;
}

export async function resolveClerkUserId(
  email: string,
  storedClerkUserId?: string | null
): Promise<string | null> {
  if (storedClerkUserId) {
    return storedClerkUserId;
  }

  return findClerkUserIdByEmail(email);
}

export async function lockClerkUser(clerkUserId: string) {
  const client = getClerkBackendClient();
  await client.users.lockUser(clerkUserId);
}

export async function unlockClerkUser(clerkUserId: string) {
  const client = getClerkBackendClient();
  await client.users.unlockUser(clerkUserId);
}
