import { createProjectSchema } from "../schemas";

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

    // save to database
    console.log("Project submitted:", validatedData.data);

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
