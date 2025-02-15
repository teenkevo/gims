"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function revalidateProjects() {
  revalidateTag("projects");
}

export async function revalidateProject(projectId: string) {
  revalidateTag(`project-${projectId}`);
}

export async function revalidateAll() {
  revalidatePath("/");
  redirect("/");
}
