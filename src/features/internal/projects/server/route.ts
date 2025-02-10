import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { writeClient } from "@/sanity/lib/write-client";

// Schema for creating a project
const createProjectSchema = z.object({
  projectName: z.string(),
  dateRange: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }),
  priority: z.string(),
  clients: z.array(
    z.object({
      clientType: z.enum(["new", "existing"]),
      existingClient: z.string().optional(),
      newClientName: z.string().optional(),
    })
  ),
});

// Schema for updating project name
const updateProjectNameSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
});

// Schema for updating project dates
const updateProjectDatesSchema = z.object({
  projectId: z.string(),
  dateRange: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }),
});

// Schema for deleting project
const deleteProjectSchema = z.object({
  projectId: z.string(),
});

const app = new Hono()
  // Create a new project
  .post("/create", zValidator("json", createProjectSchema), async (c) => {
    const { projectName, dateRange, priority, clients } = c.req.valid("json");

    let clientIds = await Promise.all(
      clients.map(async (client) => {
        if (client.clientType === "new") {
          // Create the new client
          const newClient = await writeClient.create({
            _type: "client",
            name: client.newClientName,
          });
          return newClient._id; // Return the new client's ID
        } else {
          // Use existing client ID
          return client.existingClient;
        }
      })
    );

    // Create the project
    const project = await writeClient.create(
      {
        _type: "project",
        name: projectName,
        startDate: dateRange.from,
        endDate: dateRange.to,
        priority,
        stagesCompleted: ["BILLING"], // Placeholder logic
        clients: clientIds.map((clientId) => ({
          _type: "reference",
          _ref: clientId,
        })), // Reference clients
      },
      {
        autoGenerateArrayKeys: true,
      }
    );

    return c.json({ project });
  })

  // Update project name
  .post(
    "/update-name",
    zValidator("json", updateProjectNameSchema),
    async (c) => {
      const { projectId, projectName } = c.req.valid("json");

      const updatedProject = await writeClient
        .patch(projectId)
        .set({ name: projectName })
        .commit();

      return c.json({ updatedProject });
    }
  )

  // Update project dates
  .post(
    "/update-dates",
    zValidator("json", updateProjectDatesSchema),
    async (c) => {
      const { projectId, dateRange } = c.req.valid("json");

      const updatedProject = await writeClient
        .patch(projectId)
        .set({ startDate: dateRange.from, endDate: dateRange.to })
        .commit();

      return c.json({ updatedProject });
    }
  )
  // Delete project
  .post("/delete", zValidator("json", deleteProjectSchema), async (c) => {
    const { projectId } = c.req.valid("json");

    const deletedProject = await writeClient.delete(projectId);

    return c.json({ deletedProject });
  });

export default app;
