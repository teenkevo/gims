import { defineField, defineType } from "sanity";

export const appRole = defineType({
  name: "appRole",
  type: "document",
  title: "Permission Set",
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Permission set name",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "permissions",
      type: "array",
      title: "Permissions",
      of: [{ type: "string" }],
      description:
        "Fine-grained module permissions (e.g. projects:read). Managed from the Security page in GIMS.",
    }),
    defineField({
      name: "createdBy",
      type: "string",
      title: "Created by",
      readOnly: true,
    }),
    defineField({
      name: "modifiedBy",
      type: "string",
      title: "Modified by",
      readOnly: true,
    }),
    defineField({
      name: "isSystem",
      type: "boolean",
      title: "System permission set",
      description: "System permission sets cannot be deleted from the app.",
      initialValue: false,
      readOnly: true,
    }),
    defineField({
      name: "archived",
      type: "boolean",
      title: "Archived",
      description: "Archived permission sets remain linked but are hidden from new assignments.",
      initialValue: false,
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: "name",
      permissions: "permissions",
    },
    prepare({ title, permissions }) {
      const count = Array.isArray(permissions) ? permissions.length : 0;
      return {
        title,
        subtitle: `${count} permission${count === 1 ? "" : "s"}`,
      };
    },
  },
});
