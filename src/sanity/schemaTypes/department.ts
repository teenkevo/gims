import { defineField, defineType } from "sanity";

export const department = defineType({
  name: "department",
  type: "document",
  title: "Department",
  fields: [
    defineField({
      name: "department",
      type: "string",
      title: "Department",
    }),
    defineField({
      name: "roles",
      type: "array",
      title: "Roles",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "roleName",
              type: "string",
              title: "Role Name",
            },
            {
              name: "description",
              type: "array",
              title: "Job Description",
              of: [
                {
                  type: "block",
                  styles: [
                    { title: "Normal", value: "normal" },
                    { title: "H2", value: "h2" },
                    { title: "H3", value: "h3" },
                    { title: "H4", value: "h4" },
                  ],
                  lists: [
                    { title: "Bullet", value: "bullet" },
                    { title: "Number", value: "number" },
                  ],
                  marks: {
                    decorators: [
                      { title: "Strong", value: "strong" },
                      { title: "Emphasis", value: "em" },
                      { title: "Code", value: "code" },
                      { title: "Underline", value: "underline" },
                      { title: "Strike", value: "strike-through" },
                    ],
                  },
                },
              ],
            },
            {
              name: "jobDescriptionFile",
              type: "file",
              title: "Job Description PDF",
              options: {
                accept: "application/pdf",
              },
            },
            {
              name: "appRoles",
              type: "array",
              title: "Permission sets",
              description:
                "Permissions granted to personnel with this departmental job title.",
              of: [{ type: "reference", to: [{ type: "appRole" }] }],
            },
            {
              name: "appRole",
              type: "reference",
              title: "Permission set (legacy)",
              description: "Deprecated. Use Permission sets instead.",
              to: [{ type: "appRole" }],
              hidden: true,
            },
          ],
        },
      ],
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
  ],
});
