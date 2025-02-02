import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { backendClient } from "@/sanity/lib/backendClient";

// server-side create project schema
const createProjectSchema = z.object({
  projectName: z.string(),
  dateRange: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }),
  priority: z.string(),
  clientType: z.enum(["new", "existing"]),
  existingClient: z.string().optional(),
  newClientName: z.string().optional(),
  newClientEmail: z.string().optional(),
  newClientPhone: z.string().optional(),
});

const app = new Hono().post(
  "/create",
  zValidator("json", createProjectSchema),

  async (c) => {
    const {
      projectName,
      dateRange,
      priority,
      clientType,
      existingClient,
      newClientEmail,
      newClientName,
      newClientPhone,
    } = c.req.valid("json");

    if (clientType === "new") {
      // Create the client first
      const client = await backendClient.create({
        _type: "client", // Ensure this matches your client schema type
        name: newClientName,
        email: newClientEmail,
        phoneNumber: newClientPhone,
      });

      // Now create the project with a reference to the newly created client
      const project = await backendClient.create({
        _type: "project",
        name: projectName,
        startDate: dateRange.from,
        endDate: dateRange.to,
        priority,
        stagesCompleted: ["BILLING"], //TODO: refactor the logic for this param
        client: {
          _type: "reference",
          _ref: client._id, // Use the ID of the newly created client
        },
      });

      return c.json({ project });
    } else {
      // Now create the project with a reference to the newly created client
      const project = await backendClient.create({
        _type: "project",
        name: projectName,
        startDate: dateRange.from,
        endDate: dateRange.to,
        priority,
        stagesCompleted: ["BILLING"], //TODO: refactor the logic for this param
        client: {
          _type: "reference",
          _ref: existingClient, // Use the ID of existing client
        },
      });

      return c.json({ project });
    }
  }
);

export default app;
