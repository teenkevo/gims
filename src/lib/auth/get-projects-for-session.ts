import "server-only";

import { getAllProjects } from "@/sanity/lib/projects/getAllProjects";
import { getProjectsForContact } from "@/sanity/lib/projects/getProjectsForContact";
import type { AuthContext } from "./types";
import { isClientSession } from "./project-scope";

export async function getProjectsForSession(session: AuthContext) {
  if (isClientSession(session) && session.contactPersonId) {
    return getProjectsForContact(session.contactPersonId);
  }

  return getAllProjects();
}
