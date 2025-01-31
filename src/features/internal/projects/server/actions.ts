"use server";

export async function createProject(formData: FormData) {
  const projectName = formData.get("projectName") as string;
  console.log(projectName);
}
