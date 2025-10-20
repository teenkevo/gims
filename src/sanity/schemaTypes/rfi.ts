import { Cog } from "lucide-react";
import { defineField, defineType } from "sanity";

export const rfi = defineType({
  name: "rfi",
  type: "document",
  title: "Requests for Information (RFIs)",
  fields: [
    defineField({
      name: "initiationType",
      title: "Initiation Type",
      type: "string",
      description: "Select how the RFI is initiated.",
      options: {
        list: [
          {
            title: "Internal to Internal (Lab to Lab)",
            value: "internal_internal",
          },
          {
            title: "Internal to External (Lab to Client)",
            value: "internal_external",
          },
          {
            title: "External to Internal (Client to Lab)",
            value: "external_internal",
          },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    // RFI manager
    defineField({
      name: "rfiManager",
      title: "RFI Manager",
      type: "reference",
      to: [{ type: "personnel" }],
      validation: (Rule) => Rule.required(),
      description:
        "The personnel who is responsible for managing and resolving this RFI.",
    }),
    // Link RFI to project
    defineField({
      name: "project",
      title: "Project",
      type: "reference",
      to: [{ type: "project" }],
    }),
    defineField({
      name: "client",
      title: "Client",
      type: "reference",
      to: [{ type: "client" }],
      hidden: ({ parent }) =>
        parent?.initiationType !== "internal_external" &&
        parent?.initiationType !== "external_internal",
    }),
    // 🔹 Internal to Internal (Lab to Lab)
    defineField({
      name: "labInitiator",
      title: "Lab Personnel Initiator",
      type: "reference",
      to: [{ type: "personnel" }],
      hidden: ({ parent }) => parent?.initiationType !== "internal_internal",
      validation: (Rule) =>
        Rule.custom((field, context) => {
          if (
            context.document?.initiationType === "internal_internal" &&
            !field
          ) {
            return "Lab Personnel Initiator is required for Internal RFIs.";
          }
          return true;
        }),
    }),
    defineField({
      name: "labReceivers",
      title: "Lab Personnel Receivers",
      type: "array",
      of: [{ type: "reference", to: [{ type: "personnel" }] }],
      hidden: ({ parent }) => parent?.initiationType !== "internal_internal",
      description: "Select one or more lab personnel to receive this RFI.",
      validation: (Rule) =>
        Rule.custom((field, context) => {
          if (
            context.document?.initiationType === "internal_internal" &&
            (!field || field.length === 0)
          ) {
            return "At least one Lab Personnel Receiver is required for Internal RFIs.";
          }
          return true;
        }),
    }),
    // 🔹 Internal to External (Lab to Client)
    defineField({
      name: "labInitiatorExternal",
      title: "Initiator - Lab Personnel",
      type: "reference",
      to: [{ type: "personnel" }],
      hidden: ({ parent }) => parent?.initiationType !== "internal_external",
      validation: (Rule) =>
        Rule.custom((field, context) => {
          if (
            context.document?.initiationType === "internal_external" &&
            !field
          ) {
            return "Lab Personnel Initiator is required for Internal to External RFIs.";
          }
          return true;
        }),
    }),
    defineField({
      name: "clientReceivers",
      title: "Client Contact Receivers",
      type: "array",
      of: [{ type: "reference", to: [{ type: "contactPerson" }] }],
      hidden: ({ parent }) => parent?.initiationType !== "internal_external",
      description: "Select one or more client contacts to receive this RFI.",
      validation: (Rule) =>
        Rule.custom(async (clientReceivers, context) => {
          const { document } = context;

          // Only validate for internal_external initiation type
          if (document?.initiationType !== "internal_external") {
            return true; // No validation needed for other initiation types
          }

          if (!document?.project || !document?.client) {
            return "You must select both a project and a client.";
          }

          if (!clientReceivers || clientReceivers.length === 0) {
            return "You must select at least one contact person.";
          }

          // Fetch the project document dynamically
          const project = await context
            .getClient({ apiVersion: "2022-03-07" })
            .fetch(
              `*[_type == "project" && _id == $projectId][0]{
              name,
              contactPersons[]->{_id}
            }`,
              { projectId: (document.project as { _ref: string })?._ref }
            );

          // Validate each selected contact person
          for (const clientReceiver of clientReceivers) {
            const receiverRef = (clientReceiver as { _ref: string })?._ref;
            if (!receiverRef) continue;

            // Fetch the contact person document dynamically
            const contactPerson = await context
              .getClient({ apiVersion: "2022-03-07" })
              .fetch(
                `*[_type == "contactPerson" && _id == $clientReceiver][0]{
                client->{_id,name}
              }`,
                { clientReceiver: receiverRef }
              );

            // Ensure the selected contact person is part of the project
            if (
              !project?.contactPersons?.some(
                (person: { _id: string }) => person._id === receiverRef
              )
            ) {
              return `The selected contact person is not assigned to the project "${project?.name}"`;
            }

            // Ensure the selected contact person is linked to the selected client
            if (
              contactPerson?.client?._id !==
              (document.client as { _ref?: string })?._ref
            ) {
              return "The selected contact person is not linked to the selected client.";
            }
          }

          return true; // Validation passed
        }),
    }),

    // 🔹 External to Internal (Client to Lab) - NO LAB INITIATOR REQUIRED
    defineField({
      name: "clientInitiator",
      title: "Initiator - Client Contact Person",
      type: "reference",
      to: [{ type: "contactPerson" }],
      hidden: ({ parent }) => parent?.initiationType !== "external_internal",
      validation: (Rule) =>
        Rule.custom(async (clientInitiator, context) => {
          const { document } = context;

          // Only validate for external_internal initiation type
          if (document?.initiationType !== "external_internal") {
            return true; // No validation needed for other initiation types
          }

          if (!document?.project || !document?.client) {
            return "You must select both a project and a client.";
          }

          if (
            document?.initiationType === "external_internal" &&
            !clientInitiator
          ) {
            return "Client Initiator is required for External to Internal RFIs.";
          }

          // Only validate client-initiator relationship if we have a clientInitiator
          if (!clientInitiator) {
            return true; // No validation needed if no clientInitiator selected
          }

          // Fetch the project document dynamically
          const project = await context
            .getClient({ apiVersion: "2022-03-07" })
            .fetch(
              `*[_type == "project" && _id == $projectId][0]{
              name,
              contactPersons[]->{_id}
            }`,
              { projectId: (document.project as { _ref: string })?._ref }
            );

          // Fetch the contact person document dynamically
          const contactPerson = await context
            .getClient({ apiVersion: "2022-03-07" })
            .fetch(
              `*[_type == "contactPerson" && _id == $clientInitiator][0]{
              client->{_id,name}
            }`,
              { clientInitiator: clientInitiator._ref }
            );

          // Ensure the selected contact person is part of the project
          if (
            !project?.contactPersons?.some(
              (person: { _id: string }) => person._id === clientInitiator._ref
            )
          ) {
            return `The selected contact person is not assigned to the project "${project?.name}"`;
          }

          // Ensure the selected contact person is linked to the selected client
          if (
            contactPerson?.client?._id !==
            (document.client as { _ref?: string })?._ref
          ) {
            return "The selected contact person is not linked to the selected client.";
          }

          return true;
        }),
      options: {
        // TODO: use correct types instead of any
        filter: async ({ document }: { document: any }) => {
          if (!document?.project || !document?.client) {
            return { filter: "_id == ''", params: {} }; // No results if no project or client is selected
          }

          return {
            filter:
              "references($clientId) && _id in *[_type == 'project' && _id == $projectId][0].contactPersons[]._ref",
            params: {
              clientId: document.client?._ref || "",
              projectId: document.project?._ref || "",
            },
          };
        },
      },
    }),
    defineField({
      name: "labReceiversExternal",
      title: "Lab Personnel Receivers",
      type: "array",
      of: [{ type: "reference", to: [{ type: "personnel" }] }],
      hidden: ({ parent }) => parent?.initiationType !== "external_internal",
      description: "Select one or more lab personnel to receive this RFI.",
    }),
    defineField({
      name: "subject",
      title: "RFI Subject",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Initial Query",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "attachments",
      title: "Attachments (Initial Message)",
      type: "array",
      of: [
        {
          type: "file",
          options: {
            accept: "image/*,application/pdf",
          },
        },
      ],
      description: "Attach relevant files for the initial RFI request.",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Open", value: "open" },
          { title: "In Progress", value: "in_progress" },
          { title: "Resolved", value: "resolved" },
        ],
      },
      initialValue: "open",
    }),
    defineField({
      name: "statusHistory",
      title: "Status History",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "status",
              type: "string",
              title: "Status",
              options: {
                list: [
                  { title: "Open", value: "open" },
                  { title: "In Progress", value: "in_progress" },
                  { title: "Resolved", value: "resolved" },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "timestamp",
              type: "datetime",
              title: "Change Date",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "changedBy",
              type: "reference",
              to: [{ type: "personnel" }],
              title: "Changed By",
            }),
            defineField({
              name: "reason",
              type: "text",
              title: "Reason for Change",
              description:
                "Reason for the status change (required for reopening)",
            }),
            defineField({
              name: "previousStatus",
              type: "string",
              title: "Previous Status",
              options: {
                list: [
                  { title: "Open", value: "open" },
                  { title: "In Progress", value: "in_progress" },
                  { title: "Resolved", value: "resolved" },
                ],
              },
            }),
          ],
        },
      ],
      description: "Complete audit trail of all status changes",
    }),
    defineField({
      name: "conversation",
      title: "Conversation Thread",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            // mark as official response
            defineField({
              name: "isOfficialResponse",
              title: "Is Official Response?",
              type: "boolean",
              description:
                "If true, this message is an official response to the RFI.",
              initialValue: false,
            }),
            defineField({
              name: "message",
              title: "Message",
              type: "text",
              validation: (Rule) => Rule.required(),
            }),
            // AN ARRAY OF MESSAGES THAT THIS MESSAGE RESPONDS TO. THESE SHOULD SELF-REFERERENCE ALREADY EXISTING MESSAGES IN THE CONVERSATION ARRAY.
            defineField({
              name: "sentByClient",
              title: "Sent by Client?",
              type: "boolean",
              description:
                "If true, message was sent by a Client Contact Person. If false, it was sent by Lab Personnel.",
              initialValue: true,
            }),
            defineField({
              name: "clientSender",
              title: "Client Contact Person",
              type: "reference",
              to: [{ type: "contactPerson" }],
              hidden: ({ parent }) => !parent?.sentByClient,
              options: {
                // TODO: use correct types instead of any
                filter: async ({ document }: { document: any }) => {
                  if (!document?.project || !document?.client) {
                    return { filter: "_id == ''", params: {} }; // No results if no project or client is selected
                  }
                  return {
                    filter:
                      "references($clientId) && _id in *[_type == 'project' && _id == $projectId][0].contactPersons[]._ref",
                    params: {
                      clientId: document.client?._ref || "",
                      projectId: document.project?._ref || "",
                    },
                  };
                },
              },
              validation: (Rule) =>
                Rule.custom(async (clientSender, context) => {
                  // ONLY CHECK FOR CLIENT SENDER IF THE SPECIFIC MESSAGE IS SENT BY THE CLIENT
                  if (
                    (context.parent as { sentByClient?: boolean })
                      ?.sentByClient &&
                    !clientSender
                  ) {
                    return "You must select a contact person.";
                  }

                  return true;
                }),
            }),
            defineField({
              name: "labSender",
              title: "Lab Personnel",
              type: "reference",
              to: [{ type: "personnel" }],
              hidden: ({ parent }) => parent?.sentByClient,
              validation: (Rule) =>
                Rule.custom(async (labSender, context) => {
                  // ONLY CHECK FOR LAB SENDER IF THE SPECIFIC MESSAGE IS SENT BY THE LAB
                  if (
                    !(context.parent as { sentByClient?: boolean })
                      ?.sentByClient &&
                    !labSender
                  ) {
                    return "You must select a lab personnel.";
                  }
                  return true;
                }),
            }),
            defineField({
              name: "attachments",
              title: "Attachments (Reply Message)",
              type: "array",
              of: [
                {
                  type: "file",
                },
              ],
              description: "Attach files relevant to this response.",
            }),
            defineField({
              name: "timestamp",
              title: "Timestamp",
              type: "datetime",
              options: { dateFormat: "YYYY-MM-DD HH:mm" },
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              message: "message",
              sentByClient: "sentByClient",
              clientSender: "clientSender.name",
              labSender: "labSender.fullName",
              timestamp: "timestamp", // User-uploaded icon (if available)
            },
            prepare(selection) {
              const { sentByClient, clientSender, labSender, timestamp } =
                selection;

              return {
                title: `Message from ${sentByClient ? "Client" : "Lab"}`,
                subtitle: `${new Date(timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} - ${clientSender || labSender}`,
              };
            },
          },
        },
      ],
      description: "All responses and follow-ups within this RFI",
    }),
    defineField({
      name: "dateSubmitted",
      title: "Date Submitted",
      type: "datetime",
      options: { dateFormat: "YYYY-MM-DD HH:mm" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "dateResolved",
      title: "Date Resolved",
      type: "datetime",
      options: { dateFormat: "YYYY-MM-DD HH:mm" },
    }),
  ],
  preview: {
    select: {
      initiationType: "initiationType",
      project: "project.name",
      dateSubmitted: "dateSubmitted",
      status: "status",
      labInitiator: "labInitiator.fullName",
      clientInitiator: "clientInitiator.fullName",
      labReceivers: "labReceivers.fullName",
      clientReceivers: "clientReceivers.name",
      labReceiversExternal: "labReceiversExternal.fullName",
    },

    prepare(selection) {
      const {
        initiationType,
        project,
        dateSubmitted,
        status,
        labInitiator,
        clientInitiator,
        labReceivers,
        clientReceivers,
        labReceiversExternal,
      } = selection;

      const initiationTypes = {
        internal_internal: {
          title: "Internal",
          value: "internal_internal",
        },
        internal_external: {
          title: "Outgoing RFI to Client",
          value: "internal_external",
        },
        external_internal: {
          title: "Incoming RFI from Client",
          value: "external_internal",
        },
      } as const;

      type InitiationTypeKey = keyof typeof initiationTypes;

      const type = initiationTypes[initiationType as InitiationTypeKey] || {
        title: "Unknown Initiation Type",
        icon: Cog,
      };

      return {
        title: type.title,
        subtitle: `${new Date(dateSubmitted).toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })} - ${project || "No project involved"}`,
      };
    },
  },
});
