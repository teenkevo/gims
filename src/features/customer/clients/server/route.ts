import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { writeClient } from "@/sanity/lib/write-client";
import { revalidateProject } from "@/lib/actions";

// Schema for updating client name
const updateClientNameSchema = z.object({
  clientId: z.string(),
  clientName: z.string(),
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

const updateContactSchema = z.object({
  contactId: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  designation: z.string(),
});

const removeClientFromProjectSchema = z.object({
  projectId: z.string(),
  clientId: z.string(),
});

const addClientToProjectSchema = z.object({
  projectId: z.string(),
  clientType: z.enum(["new", "existing"]),
  existingClient: z.string().optional(),
  newClientName: z.string().optional(),
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
  )
  .post(
    "/update-contact",
    zValidator("json", updateContactSchema),
    async (c) => {
      const { contactId, name, email, phone, designation } =
        c.req.valid("json");

      const updatedContact = await writeClient
        .patch(contactId)
        .set({ name, email, phone, designation })
        .commit();
      return c.json({ updatedContact });
    }
  )
  // Contact persons might also not to be desociated from project after client is dissociated from project because contact persons are linked to a client.
  .post(
    "/remove-client-from-project",
    zValidator("json", removeClientFromProjectSchema),
    async (c) => {
      const { projectId, clientId } = c.req.valid("json");

      const updatedProject = await writeClient
        .patch(projectId)
        .unset([`clients[_ref == "${clientId}"]`])
        .commit();
      return c.json({ updatedProject });
    }
  )
  .post(
    "/add-client-to-project",
    zValidator("json", addClientToProjectSchema),
    async (c) => {
      const { projectId, clientType, existingClient, newClientName } =
        c.req.valid("json");

      if (clientType === "new") {
        // Create the new client
        const newClient = await writeClient.create({
          _type: "client",
          name: newClientName,
        });

        const updatedProject = await writeClient
          .patch(projectId)
          .setIfMissing({ clients: [] })
          .append("clients", [
            {
              _type: "reference",
              _ref: newClient._id,
            },
          ])
          .commit();

        return c.json({ updatedProject });
      } else {
        const updatedProject = await writeClient
          .patch(projectId)
          .setIfMissing({ clients: [] })
          .append("clients", [
            {
              _type: "reference",
              _ref: existingClient,
            },
          ])
          .commit();

        return c.json({ updatedProject });
      }
    }
  );

export default app;
