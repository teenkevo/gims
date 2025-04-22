import { defineField, defineType } from "sanity";

export const service = defineType({
  name: "service",
  type: "document",
  title: "Services",
  fields: [
    defineField({
      name: "code",
      title: "Service Code",
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
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "sampleClass",
      type: "reference",
      to: [{ type: "sampleClass" }],
      title: "Sample Class",
      validation: (Rule) => Rule.required(),
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
