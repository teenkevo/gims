import { defineField, defineType } from "sanity";

export const clientType = defineType({
  name: "client",
  title: "Clients",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Client Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
  ],
});
