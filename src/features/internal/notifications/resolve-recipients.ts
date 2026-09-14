import "server-only";

import { writeClient } from "@/sanity/lib/write-client";
import type { NotificationRecipient } from "./events";

const INACTIVE_STATUSES = [
  "inactive",
  "terminated",
  "retired",
  "resigned",
];

export async function resolveDepartmentRecipients(
  departmentIds: string[]
): Promise<NotificationRecipient[]> {
  if (departmentIds.length === 0) {
    return [];
  }

  const people = await writeClient.fetch<
    Array<{ email?: string | null; fullName?: string | null }>
  >(
    `*[
      _type == "personnel"
      && defined(email)
      && email != ""
      && !(status in $inactive)
      && count(departmentRoles[department._ref in $departmentIds]) > 0
    ]{ email, fullName }`,
    { departmentIds, inactive: INACTIVE_STATUSES }
  );

  const byEmail = new Map<string, NotificationRecipient>();
  for (const person of people ?? []) {
    const email = person.email?.trim().toLowerCase();
    if (!email) continue;
    if (byEmail.has(email)) continue;
    byEmail.set(email, {
      email,
      fullName: person.fullName?.trim() || email,
    });
  }

  return [...byEmail.values()];
}

export async function resolveDepartmentIdsByName(
  names: string[]
): Promise<string[]> {
  const wanted = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
  if (wanted.length === 0) return [];

  const departments = await writeClient.fetch<Array<string | null>>(
    `*[_type == "department" && department in $names]._id`,
    { names: wanted }
  );

  return (departments ?? []).flatMap((id) => (id ? [id] : []));
}
