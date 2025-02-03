import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { backendClient } from "@/sanity/lib/backendClient";

// Schema for updating client name
const updateClientNameSchema = z.object({
  clientId: z.string(),
  clientName: z.string(),
});

// Schema for updating client email
const updateClientEmailSchema = z.object({
  clientId: z.string(),
  clientEmail: z.string(),
});

// Schema for updating client phone
const updateClientPhoneSchema = z.object({
  clientId: z.string(),
  phone: z.string(),
});

const app = new Hono()
  // Update client name
  .post(
    "/update-name",
    zValidator("json", updateClientNameSchema),
    async (c) => {
      const { clientId, clientName } = c.req.valid("json");

      const updatedClient = await backendClient
        .patch(clientId)
        .set({ name: clientName })
        .commit();

      return c.json({ updatedClient });
    }
  )

  // Update client email
  .post(
    "/update-email",
    zValidator("json", updateClientEmailSchema),
    async (c) => {
      const { clientId, clientEmail } = c.req.valid("json");

      const updatedClient = await backendClient
        .patch(clientId)
        .set({ email: clientEmail })
        .commit();

      return c.json({ updatedClient });
    }
  )

  // Update client phone
  .post(
    "/update-phone",
    zValidator("json", updateClientPhoneSchema),
    async (c) => {
      const { clientId, phone } = c.req.valid("json");

      const updatedClient = await backendClient
        .patch(clientId)
        .set({ phone })
        .commit();
      return c.json({ updatedClient });
    }
  );

export default app;
