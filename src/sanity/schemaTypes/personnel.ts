import { defineField, defineType } from "sanity";
import CustomRoleInput from "../components/custom-role-input";

export const personnel = defineType({
  name: "personnel",
  type: "document",
  title: "Personnel",
  fields: [
    defineField({
      name: "internalId",
      type: "string",
      title: "Internal ID",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "fullName",
      type: "string",
      title: "Full Name",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "departmentRoles",
      type: "array",
      title: "Department Roles",
      validation: (Rule) =>
        Rule.unique().error("Department roles must not be the same").required(),
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "department",
              type: "reference",
              to: [{ type: "department" }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "role",
              type: "string",
              title: "Role",
              validation: (Rule) => Rule.required(),
              components: {
                input: CustomRoleInput,
              },
            }),
          ],
          preview: {
            // Pick which bits you need
            select: {
              deptName: "department.department",
              role: "role",
            },
            // Format them into title/subtitle
            prepare({ deptName, role }) {
              return {
                title: deptName,
                subtitle: role ? `Role: ${role}` : "No role assigned",
              };
            },
          },
        },
      ],
    }),

    defineField({
      name: "email",
      type: "email",
      title: "Email",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "phone",
      type: "string",
      title: "Phone Number",
      validation: (Rule) => Rule.required(),
    }),

    // Connect to projects
    defineField({
      name: "projects",
      type: "reference",
      to: [{ type: "project" }],
    }),
    defineField({
      name: "status",
      type: "string",
      title: "Status",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Inactive", value: "inactive" },
          { title: "On Leave", value: "on-leave" },
          { title: "Terminated", value: "terminated" },
          { title: "Retired", value: "retired" },
          { title: "Resigned", value: "resigned" },
          { title: "Other", value: "other" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    // Pick which bits you need
    select: {
      title: "fullName",
      subtitle: "internalId",
    },
    // Format them into title/subtitle
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle,
      };
    },
  },
});
// // ADMIN DOES BELOW
// WHO CREATES PERSONNEL?
// WHO UPDATES PERSONNEL?
// WHO DELETES PERSONNEL?
// WHO CAN VIEW PERSONNEL?

// // TECH MANAGER --> SENIOR LAB ENG --> LAB ENG --> LAB TECHS
// WHO CAN ASSIGN PERSONNEL TO PROJECTS?
// WHO CAN UPDATE PERSONNEL IN A PROJECT?
// WHO CAN DELETE PERSONNEL FROM A PROJECT?
// WHO CAN VIEW PERSONNEL IN A PROJECT?

// // SHOW CURRENT CAPACITY OF LAB TECH

// // ADMINS
// WHO CAN CREATE PROJECTS?
// WHO CAN UPDATE PROJECTS?
// WHO CAN DELETE PROJECTS?
// WHO CAN VIEW PROJECTS?
