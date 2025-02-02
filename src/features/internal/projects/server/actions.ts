import { createProjectSchema } from "../schemas";
import { backendClient } from "@/sanity/lib/backendClient";

export async function createProject(_: unknown, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());

    const parsedData = {
      ...rawData,
      dateRange: {
        from: new Date(rawData.dateFrom as string),
        to: new Date(rawData.dateTo as string),
      },
    };

    // TODO: mark this action with "use server" after removing client-blocking zod schema below
    const validatedData = createProjectSchema.safeParse(parsedData);

    if (!validatedData.success) {
      return {
        success: false,
        message: "Please fix the errors in the form",
        errors: validatedData.error.flatten().fieldErrors,
        inputs: parsedData,
      };
    }

    const {
      projectName,
      dateRange,
      clientType,
      existingClient,
      newClientEmail,
      newClientName,
      newClientPhone,
    } = validatedData.data;

    // Then, create a project referencing that client
    const project = await backendClient.create({
      _type: "project",
      name: projectName,
      startDate: dateRange.from,
      endDate: dateRange.to,
      client: {
        _type: "client",
        name: newClientName,
        email: newClientEmail,
        phoneNumber: newClientPhone,
      },
    });

    console.log("Project created:", project);

    return {
      success: true,
      message: "Your project has been created",
    };
  } catch (error) {
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}
