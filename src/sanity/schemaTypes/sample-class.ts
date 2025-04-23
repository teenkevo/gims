import { defineField, defineType } from "sanity";

export const sampleClass = defineType({
  name: "sampleClass",
  type: "document",
  title: "Sample Classes",
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Name",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      type: "string",
      title: "Description",
    }),
    defineField({
      name: "subclasses",
      type: "array",
      title: "Sample Subclasses",
      description: "Add one or more subclasses for this sample class",
      of: [
        {
          type: "object",
          name: "subclass",
          fields: [
            defineField({
              name: "name",
              type: "string",
              title: "Name",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "key",
              type: "string",
              title: "Key",
              description: "A unique identifier for this subclass",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: "name",
              subtitle: "key",
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "description",
    },
  },
});
