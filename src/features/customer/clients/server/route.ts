import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { writeClient } from "@/sanity/lib/write-client";
import { authMiddleware } from "@/lib/auth/api";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { checkContactEmailExists } from "@/sanity/lib/clients/getContactByEmail";
import { inviteContactToPortal } from "@/lib/auth/contact-invite";
import { sanitizePhoneNumber } from "@/lib/utils";

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
    authMiddleware(PERMISSIONS["clients:update"]),
    zValidator("json", updateClientNameSchema),
    async (c) => {
    const { clientId, clientName } = c.req.valid("json");

    const updatedClient = await writeClient.patch(clientId).set({ name: clientName }).commit();

    return c.json({ updatedClient });
  })

  .post(
    "/create-contact",
    authMiddleware(PERMISSIONS["clients:update"]),
    zValidator("json", createContactSchema),
    async (c) => {
    const auth = c.get("auth");
    const { projectId, clientId, contactType, existingContact, name, email, phone, designation } =
      c.req.valid("json");

    if (contactType === "new") {
      if (!name || !email || !phone || !designation) {
        return c.json({ error: "Missing required contact fields" }, 400);
      }

      const duplicateContact = await checkContactEmailExists(email, clientId);
      if (duplicateContact) {
        return c.json(
          { error: `A contact with email ${email} already exists for this client` },
          400
        );
      }

      const newContactPerson = await writeClient.create(
        {
          _type: "contactPerson",
          name,
          email,
          phone: sanitizePhoneNumber(phone),
          designation,
          appAccessStatus: "none",
          client: {
            _type: "reference",
            _ref: clientId,
          },
        },
        {
          autoGenerateArrayKeys: true,
        }
      );

      await inviteContactToPortal({
        contactPersonId: newContactPerson._id,
        email,
        fullName: name,
        clientId,
        invitedBy: auth,
      });

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

      revalidateTag("contactPerson");
      revalidateTag(`client-${clientId}`);
      revalidateTag(`project-${projectId}`);

      return c.json({ updatedProject });
    }

    if (!existingContact) {
      return c.json({ error: "Please select an existing contact" }, 400);
    }

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

      revalidateTag(`project-${projectId}`);

      return c.json({ updatedProject });
    }
  )
  .post(
    "/remove-contact-from-project",
    authMiddleware(PERMISSIONS["clients:update"]),
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
    authMiddleware(PERMISSIONS["clients:update"]),
    zValidator("json", updateContactSchema),
    async (c) => {
    const { contactId, name, email, phone, designation } = c.req.valid("json");

    const updatedContact = await writeClient
      .patch(contactId)
      .set({ name, email, phone, designation })
      .commit();
    return c.json({ updatedContact });
  })
  // Contact persons might also not to be desociated from project after client is dissociated from project because contact persons are linked to a client.
  .post(
    "/remove-client-from-project",
    authMiddleware(PERMISSIONS["clients:update"]),
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
    authMiddleware(PERMISSIONS["clients:update"]),
    zValidator("json", addClientToProjectSchema),
    async (c) => {
    const { projectId, clientType, existingClient, newClientName } = c.req.valid("json");

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
  });

export default app;
