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
          { title: "Submitted", value: "submitted" },
          { title: "Approved", value: "approved" },
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
      fields: [
        defineField({
          name: "acknowledgementText",
          title: "Acknowledgement Text",
          type: "text",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "clientSignature",
          title: "Client Signature",
          type: "string",
          validation: (Rule) => Rule.required(),
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
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),

    // GETLAB Acknowledgement
    defineField({
      name: "getlabAcknowledgement",
      title: "GETLAB Acknowledgement",
      type: "object",
      fields: [
        defineField({
          name: "expectedDeliveryDate",
          title: "Expected Delivery Date",
          type: "date",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "requiresMoreSamples",
          title: "Client Should Deliver More Samples",
          type: "boolean",
          initialValue: false,
        }),
        defineField({
          name: "sampleRetentionDuration",
          title: "Sample Retention Duration",
          type: "string",
          description:
            "Duration for sample to be retained in case sample remains after testing",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "acknowledgementText",
          title: "Additional Acknowledgement Notes",
          type: "text",
        }),
      ],
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
              { title: "SLE", value: "sle" },
              { title: "Lab. Eng.", value: "lab-eng" },
              { title: "Jn. Lab. Eng.", value: "jn-lab-eng" },
              { title: "Sen. Lab. Technician", value: "sen-lab-technician" },
              { title: "Lab Technician", value: "lab-technician" },
              { title: "Lab Assistant", value: "lab-assistant" },
              { title: "Admin. Personnel", value: "admin-personnel" },
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

    // Submission Information
    defineField({
      name: "submittedBy",
      title: "Submitted By",
      type: "reference",
      to: [{ type: "personnel" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted At",
      type: "datetime",
      options: { dateFormat: "YYYY-MM-DD HH:mm" },
      validation: (Rule) => Rule.required(),
    }),

    // Additional Metadata
    defineField({
      name: "version",
      title: "Version",
      type: "string",
      initialValue: "1.0",
      description: "Version of the verification form",
    }),
    defineField({
      name: "notes",
      title: "Additional Notes",
      type: "text",
      description: "Any additional notes or comments",
    }),
  ],
  preview: {
    select: {
      project: "project.name",
      projectClients: "project.clients.0.name",
      verificationDate: "verificationDate",
      status: "status",
      overallStatus: "overallStatus",
      submittedBy: "submittedBy.fullName",
    },
    prepare(selection) {
      const {
        project,
        projectClients,
        verificationDate,
        status,
        overallStatus,
        submittedBy,
      } = selection;

      return {
        title: `${project}${projectClients ? ` - ${projectClients}` : ""}`,
        subtitle: `${new Date(verificationDate).toLocaleDateString()} | ${status} | ${overallStatus} | By: ${submittedBy}`,
      };
    },
  },
});
