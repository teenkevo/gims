"use server";

import { writeClient } from "@/sanity/lib/write-client";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function updateClientName(
  clientId: string,
  projectId: string,
  formData: FormData
) {
  try {
    const clientName = formData.get("clientName");
    const result = await writeClient
      .patch(clientId as string)
      .set({ name: clientName as string })
      .commit();
    // TODO: Possible bug, no tag is specified but revalidateTag seems to update cache
    revalidateTag(`project-${projectId}`);
    return { result, status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
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
