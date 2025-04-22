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
  ],
});
