import { defineField, defineType } from "sanity";

export const sampleReceipt = defineType({
  name: "sampleReceipt",
  title: "Sample Receipt",
  type: "document",
  fields: [
    // Project Reference (includes client through project relationship)
    defineField({
      name: "project",
      title: "Project",
      type: "reference",
      to: [{ type: "project" }],
      validation: (Rule) => Rule.required(),
    }),

    // Verification Metadata
    defineField({
      name: "verificationDate",
      title: "Verification Date",
      type: "datetime",
      options: { dateFormat: "YYYY-MM-DD HH:mm" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Submitted for Approval", value: "submitted" },
          { title: "Approved Internally", value: "approved" },
          { title: "Sent to Client", value: "sent_to_client" },
          { title: "Client Acknowledged", value: "client_acknowledged" },
          { title: "Rejected", value: "rejected" },
        ],
      },
      initialValue: "draft",
    }),

    // Review Items - Three State with Comments
    defineField({
      name: "reviewTemplate",
      title: "Review Template",
      type: "reference",
      to: [{ type: "sampleReviewTemplate" }],
      validation: (Rule) => Rule.required(),
      description: "Select the review template to use for this verification",
    }),
    defineField({
      name: "reviewItems",
      title: "Review Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "templateItemId",
              title: "Template Item ID",
              type: "number",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "label",
              title: "Review Point",
              type: "text",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "status",
              title: "Status",
              type: "string",
              options: {
                list: [
                  { title: "Yes", value: "yes" },
                  { title: "No", value: "no" },
                  { title: "Not Applicable", value: "not-applicable" },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "comments",
              title: "Comments",
              type: "text",
              description: "Comments are required when status is 'No'",
              validation: (Rule) =>
                Rule.custom((comments, context) => {
                  const status = (context.parent as { status?: string })
                    ?.status;
                  if (
                    status === "no" &&
                    (!comments || comments.trim() === "")
                  ) {
                    return "Comments are required when status is 'No'";
                  }
                  return true;
                }),
            }),
          ],
          preview: {
            select: {
              label: "label",
              status: "status",
              comments: "comments",
            },
            prepare(selection) {
              const { label, status, comments } = selection;
              return {
                title:
                  label?.substring(0, 50) + (label?.length > 50 ? "..." : ""),
                subtitle: `${status}${comments ? ` - ${comments.substring(0, 30)}...` : ""}`,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),

    // Adequacy Checks
    defineField({
      name: "adequacyTemplate",
      title: "Adequacy Template",
      type: "reference",
      to: [{ type: "sampleAdequacyTemplate" }],
      validation: (Rule) => Rule.required(),
      description: "Select the adequacy template to use for this verification",
    }),
    defineField({
      name: "adequacyChecks",
      title: "Adequacy Checks",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "templateItemId",
              title: "Template Item ID",
              type: "number",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "label",
              title: "Requirement",
              type: "text",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "required",
              title: "Required",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "status",
              title: "Status",
              type: "string",
              options: {
                list: [
                  { title: "Adequate", value: "adequate" },
                  { title: "Inadequate", value: "inadequate" },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "comments",
              title: "Comments",
              type: "text",
              description: "Comments are required when status is 'Inadequate'",
              validation: (Rule) =>
                Rule.custom((comments, context) => {
                  const status = (context.parent as { status?: string })
                    ?.status;
                  if (
                    status === "inadequate" &&
                    (!comments || comments.trim() === "")
                  ) {
                    return "Comments are required when status is 'Inadequate'";
                  }
                  return true;
                }),
            }),
          ],
          preview: {
            select: {
              label: "label",
              status: "status",
              required: "required",
            },
            prepare(selection) {
              const { label, status, required } = selection;
              return {
                title:
                  label?.substring(0, 50) + (label?.length > 50 ? "..." : ""),
                subtitle: `${status}${required ? " (Required)" : ""}`,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),

    // Overall Assessment
    defineField({
      name: "overallStatus",
      title: "Overall Status",
      type: "string",
      options: {
        list: [
          { title: "Satisfactory", value: "satisfactory" },
          { title: "Unsatisfactory/Rejected", value: "unsatisfactory" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "overallComments",
      title: "Overall Comments",
      type: "text",
      description: "Additional comments on the overall assessment",
    }),

    // Client Acknowledgement
    defineField({
      name: "clientAcknowledgement",
      title: "Client Acknowledgement",
      type: "object",
      description: "Only required when status is 'Client Acknowledged'",
      fields: [
        defineField({
          name: "acknowledgementText",
          title: "Acknowledgement Text",
          type: "text",
        }),
        defineField({
          name: "clientSignature",
          title: "Client Signature",
          type: "string",
        }),
        defineField({
          name: "clientRepresentative",
          title: "Client Representative Type",
          type: "string",
          options: {
            list: [
              { title: "Client's Rep.", value: "client-rep" },
              { title: "Contractor's Rep.", value: "contractor-rep" },
              { title: "Consultant's Rep.", value: "consultant-rep" },
            ],
          },
        }),
      ],
      validation: (Rule) =>
        Rule.custom((clientAcknowledgement, context) => {
          const status = (context.document as { status?: string })?.status;

          // If status is client_acknowledged, all fields are required
          if (status === "client_acknowledged") {
            if (!clientAcknowledgement) {
              return "Client acknowledgement is required when status is 'Client Acknowledged'";
            }

            const {
              acknowledgementText,
              clientSignature,
              clientRepresentative,
            } = clientAcknowledgement as {
              acknowledgementText?: string;
              clientSignature?: string;
              clientRepresentative?: string;
            };

            if (!acknowledgementText || acknowledgementText.trim() === "") {
              return "Acknowledgement text is required when client has acknowledged";
            }

            if (!clientSignature || clientSignature.trim() === "") {
              return "Client signature is required when client has acknowledged";
            }

            if (!clientRepresentative || clientRepresentative.trim() === "") {
              return "Client representative is required when client has acknowledged";
            }
          }

          return true;
        }),
    }),

    // GETLAB Acknowledgement
    defineField({
      name: "getlabAcknowledgement",
      title: "GETLAB Acknowledgement",
      type: "object",
      description: "Only required when GETLAB has approved the sample receipt",
      fields: [
        defineField({
          name: "expectedDeliveryDate",
          title: "Expected Delivery Date",
          type: "date",
        }),
        defineField({
          name: "sampleRetentionDuration",
          title: "Sample Retention Duration",
          type: "string",
          description:
            "Duration for sample to be retained in case sample remains after testing",
        }),
        defineField({
          name: "acknowledgementText",
          title: "Additional Acknowledgement Notes",
          type: "text",
        }),
      ],
      validation: (Rule) =>
        Rule.custom((getlabAcknowledgement, context) => {
          const status = (context.document as { status?: string })?.status;

          // If status is approved, all required fields must be present
          if (status === "approved") {
            if (!getlabAcknowledgement) {
              return "GETLAB acknowledgement is required when status is 'Approved Internally'";
            }

            const { expectedDeliveryDate, sampleRetentionDuration } =
              getlabAcknowledgement as {
                expectedDeliveryDate?: string;
                sampleRetentionDuration?: string;
              };

            if (!expectedDeliveryDate) {
              return "Expected delivery date is required when GETLAB has approved the sample receipt";
            }

            if (
              !sampleRetentionDuration ||
              sampleRetentionDuration.trim() === ""
            ) {
              return "Sample retention duration is required when GETLAB has approved the sample receipt";
            }
          }

          return true;
        }),
    }),

    // Sample Receipt Personnel
    defineField({
      name: "sampleReceiptPersonnel",
      title: "Sample Receipt Personnel",
      type: "object",
      fields: [
        defineField({
          name: "role",
          title: "Role",
          type: "string",
          options: {
            list: [
              {
                title: "Senior Laboratory Engineer",
                value: "senior-laboratory-engineer",
              },
              { title: "Laboratory Engineer", value: "laboratory-engineer" },
              {
                title: "Junior Laboratory Engineer",
                value: "junior-laboratory-engineer",
              },
              {
                title: "Senior Laboratory Technician",
                value: "senior-laboratory-technician",
              },
              {
                title: "Laboratory Technician",
                value: "laboratory-technician",
              },
              { title: "Laboratory Assistant", value: "laboratory-assistant" },
              {
                title: "Administrative Personnel",
                value: "administrative-personnel",
              },
            ],
          },
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "name",
          title: "Name",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "signature",
          title: "Signature",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "personnel",
          title: "Personnel Reference",
          type: "reference",
          to: [{ type: "personnel" }],
          description: "Link to the actual personnel record",
        }),
      ],
    }),
  ],
  preview: {
    select: {
      project: "project.name",
      projectClients: "project.clients.0.name",
      verificationDate: "verificationDate",
      status: "status",
      overallStatus: "overallStatus",
      sampleReceiptPersonnel: "sampleReceiptPersonnel.fullName",
    },
    prepare(selection) {
      const {
        project,
        projectClients,
        verificationDate,
        status,
        overallStatus,
        sampleReceiptPersonnel,
      } = selection;

      return {
        title: `${project}${projectClients ? ` - ${projectClients}` : ""}`,
        subtitle: `${new Date(verificationDate).toLocaleDateString()} | ${status} | ${overallStatus} | By: ${sampleReceiptPersonnel}`,
      };
    },
  },
});
