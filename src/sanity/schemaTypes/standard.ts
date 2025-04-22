import { defineField, defineType } from "sanity";

export const standard = defineType({
  name: "standard",
  type: "document",
  title: "Standards",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "acronym",
      type: "string",
      title: "Acronym",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
    }),
  ],
});
