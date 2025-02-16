"use server";

import { writeClient } from "@/sanity/lib/write-client";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function updateClientName(
  clientId: string,
  projectId: string,
  formData: FormData
) {
  const clientName = formData.get("clientName");
  await writeClient
    .patch(clientId as string)
    .set({ name: clientName as string })
    .commit();
  revalidateTag(`project-${projectId}`);
}

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
