import { backendClient } from "../backendClient";

export const deleteProject = async (projectId: string) => {
  try {
    const result = backendClient.delete(projectId);
    return result;
  } catch (error) {
    console.error("Error deleting project", error);
    return [];
  }
};
