import { backendClient } from "../backendClient";

export const updateClientEmail = async (clientId: string, email: string) => {
  try {
    const result = backendClient.patch(clientId).set({ email });
    return result;
  } catch (error) {
    console.error("Error updating client email", error);
    return [];
  }
};
