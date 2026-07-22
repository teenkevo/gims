import { defineField, defineType } from "sanity";

export const report = defineType({
  name: "report",
  title: "Report",
  type: "document",
  fields: [
    defineField({
      name: "project",
      title: "Project",
      type: "reference",
      to: [{ type: "project" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "reportNumber",
      title: "Report Number",
      type: "string",
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "revisionNumber",
      title: "Revision Number",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "title",
      title: "Report Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary / Notes",
      type: "text",
      description: "Optional notes about the report contents",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Submitted for QA", value: "submitted" },
          { title: "Revisions Requested", value: "revisions_requested" },
          { title: "Rejected", value: "rejected" },
          { title: "Sent to Client", value: "sent_to_client" },
        ],
      },
      initialValue: "draft",
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted At",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "sentToClientAt",
      title: "Sent to Client At",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "qaReview",
      title: "QA Review",
      type: "object",
      fields: [
        defineField({
          name: "decision",
          title: "Decision",
          type: "string",
          options: {
            list: [
              { title: "Accept", value: "accept" },
              { title: "Reject", value: "reject" },
              { title: "Request Revisions", value: "revisions_requested" },
            ],
          },
        }),
        defineField({
          name: "notes",
          title: "Review Notes",
          type: "text",
          description:
            "Required when rejecting or requesting revisions. Optional when accepting.",
          validation: (Rule) =>
            Rule.custom((notes, context) => {
              const decision = (context.parent as { decision?: string })
                ?.decision;
              if (
                (decision === "reject" || decision === "revisions_requested") &&
                (!notes || notes.trim() === "")
              ) {
                return "Notes are required when rejecting or requesting revisions";
              }
              return true;
            }),
        }),
        defineField({
          name: "reviewedAt",
          title: "Reviewed At",
          type: "datetime",
          readOnly: true,
        }),
        defineField({
          name: "reviewedBy",
          title: "Reviewed By",
          type: "object",
          fields: [
            defineField({
              name: "personnel",
              title: "Personnel",
              type: "reference",
              to: [{ type: "personnel" }],
            }),
            defineField({
              name: "name",
              title: "Name",
              type: "string",
            }),
            defineField({
              name: "email",
              title: "Email",
              type: "email",
            }),
            defineField({
              name: "role",
              title: "Role",
              type: "string",
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "preparedBy",
      title: "Prepared By",
      type: "object",
      fields: [
        defineField({
          name: "personnel",
          title: "Personnel",
          type: "reference",
          to: [{ type: "personnel" }],
        }),
        defineField({
          name: "name",
          title: "Name",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "role",
          title: "Role",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "file",
      title: "Report PDF",
      type: "file",
      options: {
        accept: "application/pdf",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "revisions",
      title: "Report Revisions",
      type: "array",
      of: [{ type: "reference", to: [{ type: "report" }] }],
      validation: (Rule) => Rule.unique(),
      description: "Previous versions when revisions are requested or rejected",
    }),
    defineField({
      name: "queries",
      title: "Client Queries",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "subject",
              title: "Subject",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "status",
              title: "Status",
              type: "string",
              options: {
                list: [
                  { title: "Open", value: "open" },
                  { title: "Answered", value: "answered" },
                  { title: "Closed", value: "closed" },
                ],
              },
              initialValue: "open",
            }),
            defineField({
              name: "createdAt",
              title: "Created At",
              type: "datetime",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "createdBy",
              title: "Created By",
              type: "object",
              fields: [
                defineField({
                  name: "contactPerson",
                  title: "Contact Person",
                  type: "reference",
                  to: [{ type: "contactPerson" }],
                }),
                defineField({
                  name: "name",
                  title: "Name",
                  type: "string",
                }),
                defineField({
                  name: "email",
                  title: "Email",
                  type: "email",
                }),
              ],
            }),
            defineField({
              name: "messages",
              title: "Messages",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    defineField({
                      name: "message",
                      title: "Message",
                      type: "text",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: "sentByClient",
                      title: "Sent by Client?",
                      type: "boolean",
                      initialValue: true,
                    }),
                    defineField({
                      name: "senderName",
                      title: "Sender Name",
                      type: "string",
                    }),
                    defineField({
                      name: "senderEmail",
                      title: "Sender Email",
                      type: "email",
                    }),
                    defineField({
                      name: "contactPerson",
                      title: "Contact Person",
                      type: "reference",
                      to: [{ type: "contactPerson" }],
                    }),
                    defineField({
                      name: "personnel",
                      title: "Lab Personnel",
                      type: "reference",
                      to: [{ type: "personnel" }],
                    }),
                    defineField({
                      name: "timestamp",
                      title: "Timestamp",
                      type: "datetime",
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: {
                    select: {
                      message: "message",
                      sentByClient: "sentByClient",
                      senderName: "senderName",
                      timestamp: "timestamp",
                    },
                    prepare({ message, sentByClient, senderName, timestamp }) {
                      return {
                        title: message?.substring(0, 60) || "Message",
                        subtitle: `${sentByClient ? "Client" : "Lab"} · ${senderName || "Unknown"} · ${timestamp ? new Date(timestamp).toLocaleString() : ""}`,
                      };
                    },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: {
              subject: "subject",
              status: "status",
              createdAt: "createdAt",
            },
            prepare({ subject, status, createdAt }) {
              return {
                title: subject || "Query",
                subtitle: `${status || "open"} · ${createdAt ? new Date(createdAt).toLocaleDateString() : ""}`,
              };
            },
          },
        },
      ],
      description:
        "Client questions about the report once it has been sent to them",
    }),
  ],
  preview: {
    select: {
      title: "title",
      reportNumber: "reportNumber",
      status: "status",
      project: "project.name",
    },
    prepare({ title, reportNumber, status, project }) {
      return {
        title: title || reportNumber || "Report",
        subtitle: `${project || "No project"} · ${status || "draft"} · ${reportNumber || ""}`,
      };
    },
  },
});
