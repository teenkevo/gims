import { defineField, defineType } from "sanity";
import { USER_TYPES } from "@/lib/auth/user-type";

export const appUser = defineType({
  name: "appUser",
  type: "document",
  title: "App User",
  fields: [
    defineField({
      name: "clerkUserId",
      type: "string",
      title: "Clerk User ID",
    }),
    defineField({
      name: "email",
      type: "email",
      title: "Email",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "userType",
      type: "string",
      title: "User Type",
      options: {
        list: [
          { title: "Internal (Personnel)", value: USER_TYPES.INTERNAL },
          { title: "Client Contact", value: USER_TYPES.CLIENT },
          { title: "Super Admin", value: USER_TYPES.SUPER_ADMIN },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "personnel",
      type: "reference",
      title: "Linked Personnel",
      to: [{ type: "personnel" }],
    }),
    defineField({
      name: "contactPerson",
      type: "reference",
      title: "Linked Contact Person",
      to: [{ type: "contactPerson" }],
    }),
    defineField({
      name: "client",
      type: "reference",
      title: "Linked Client",
      to: [{ type: "client" }],
    }),
    defineField({
      name: "permissions",
      type: "array",
      title: "Portal Permissions",
      of: [{ type: "string" }],
      description: "Effective portal permissions for this app user.",
    }),
    defineField({
      name: "isActive",
      type: "boolean",
      title: "Active",
      initialValue: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "assignedBy",
      type: "string",
      title: "Assigned By (Clerk User ID)",
    }),
    defineField({
      name: "assignedAt",
      type: "datetime",
      title: "Assigned At",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      email: "email",
      userType: "userType",
      isActive: "isActive",
    },
    prepare({ email, userType, isActive }) {
      return {
        title: email,
        subtitle: `${userType}${isActive ? "" : " (inactive)"}`,
      };
    },
  },
});
