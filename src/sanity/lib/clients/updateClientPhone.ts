import { backendClient } from "../backendClient";

export const updateClientPhone = async (clientId: string, phone: string) => {
  try {
    const result = backendClient.patch(clientId).set({
      phone,
    });
    return result;
  } catch (error) {
    console.error("Error updating client phone", error);
    return [];
  }
};
