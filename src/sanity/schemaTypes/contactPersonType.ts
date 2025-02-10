import { defineField, defineType } from "sanity";

export const contactPersonType = defineType({
  name: "contactPerson",
  title: "Contact Persons",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "email",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "designation",
      title: "Designation",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "clients",
      title: "Clients",
      type: "array",
      of: [{ type: "reference", to: [{ type: "client" }] }],
    }),
  ],
});
