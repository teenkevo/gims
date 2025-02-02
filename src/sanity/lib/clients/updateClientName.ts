import { backendClient } from "../backendClient";

export const updateClientName = async (clientId: string, name: string) => {
  try {
    const result = backendClient.patch(clientId).set({ name });
    return result;
  } catch (error) {
    console.error("Error updating client name", error);
    return [];
  }
};
