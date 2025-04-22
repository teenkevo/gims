import { defineField, defineType } from "sanity";

export const fieldTest = defineType({
  name: "fieldTest",
  type: "document",
  title: "Field Tests",
  fields: [
    defineField({
      name: "code",
      title: "Test Code",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "testParameter",
      title: "Test Parameter",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "testMethods",
      title: "Test Methods",
      type: "array",
      of: [{ type: "reference", to: [{ type: "testMethod" }] }],
    }),
    defineField({
      name: "status",
      type: "string",
      title: "Status",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Inactive", value: "inactive" },
        ],
      },
      initialValue: "active",
    }),
  ],
});
