import { backendClient } from "../backendClient";

export const updateProjectDates = async (
  projectId: string,
  dateRange: {
    from: Date;
    to: Date;
  }
) => {
  try {
    const result = backendClient.patch(projectId).set({
      startDate: dateRange.from,
      endDate: dateRange.to,
    });
    return result;
  } catch (error) {
    console.error("Error updating project dates", error);
    return [];
  }
};
