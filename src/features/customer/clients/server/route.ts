import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { writeClient } from "@/sanity/lib/write-client";

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

const createContactSchema = z.object({
  projectId: z.string(),
  clientId: z.string(),
  contactType: z.enum(["new", "existing"]),
  existingContact: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  designation: z.string().optional(),
});

const removeContactFromProjectSchema = z.object({
  projectId: z.string(),
  contactId: z.string(),
});

const app = new Hono()
  // Update client name
  .post(
    "/update-name",
    zValidator("json", updateClientNameSchema),
    async (c) => {
      const { clientId, clientName } = c.req.valid("json");

      const updatedClient = await writeClient
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

      const updatedClient = await writeClient
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

      const updatedClient = await writeClient
        .patch(clientId)
        .set({ phone })
        .commit();
      return c.json({ updatedClient });
    }
  )
  .post(
    "/create-contact",
    zValidator("json", createContactSchema),
    async (c) => {
      const {
        projectId,
        clientId,
        contactType,
        existingContact,
        name,
        email,
        phone,
        designation,
      } = c.req.valid("json");

      if (contactType === "new") {
        const newContactPerson = await writeClient.create(
          {
            _type: "contactPerson",
            name,
            email,
            phone,
            designation,
            clients: [
              {
                _type: "reference",
                _ref: clientId,
              },
            ],
          },
          {
            autoGenerateArrayKeys: true,
          }
        );

        const updatedProject = await writeClient
          .patch(projectId)
          .setIfMissing({ contactPersons: [] })
          .append("contactPersons", [
            {
              _type: "reference",
              _ref: newContactPerson._id,
            },
          ])
          .commit({ autoGenerateArrayKeys: true });

        return c.json({ updatedProject });
      } else {
        const updatedProject = await writeClient
          .patch(projectId)
          .setIfMissing({ contactPersons: [] })
          .append("contactPersons", [
            {
              _type: "reference",
              _ref: existingContact,
            },
          ])
          .commit({ autoGenerateArrayKeys: true });

        return c.json({ updatedProject });
      }
    }
  )
  .post(
    "/remove-contact-from-project",
    zValidator("json", removeContactFromProjectSchema),
    async (c) => {
      const { projectId, contactId } = c.req.valid("json");

      const updatedProject = await writeClient
        .patch(projectId)
        .unset([`contactPersons[_ref == "${contactId}"]`])
        .commit();
      return c.json({ updatedProject });
    }
  );

export default app;
