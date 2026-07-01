import { defineField, defineType } from "sanity";

export const auditLog = defineType({
  name: "auditLog",
  type: "document",
  title: "Audit Log",
  readOnly: true,
  fields: [
    defineField({
      name: "action",
      type: "string",
      title: "Action",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "resource",
      type: "string",
      title: "Resource",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "resourceId",
      type: "string",
      title: "Resource ID",
    }),
    defineField({
      name: "userId",
      type: "string",
      title: "Clerk User ID",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "userEmail",
      type: "string",
      title: "User Email",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "userRole",
      type: "string",
      title: "User Role",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "metadata",
      type: "text",
      title: "Metadata (JSON)",
    }),
    defineField({
      name: "timestamp",
      type: "datetime",
      title: "Timestamp",
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      action: "action",
      resource: "resource",
      userEmail: "userEmail",
      timestamp: "timestamp",
    },
    prepare({ action, resource, userEmail, timestamp }) {
      return {
        title: `${action} — ${resource}`,
        subtitle: `${userEmail} · ${timestamp ? new Date(timestamp).toLocaleString() : ""}`,
      };
    },
  },
});
