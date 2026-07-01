"use server";

import { revalidatePath } from "next/cache";

/** Kept for compatibility — internal access is now driven by personnel departmental roles. */
export async function refreshSecurityPage() {
  revalidatePath("/security");
}
