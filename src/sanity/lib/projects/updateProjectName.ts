import { backendClient } from "../backendClient";

export const updateProjectName = async (projectId: string, name: string) => {
  try {
    const result = backendClient.patch(projectId).set({ name });
    return result;
  } catch (error) {
    console.error("Error updating project name", error);
    return [];
  }
};
