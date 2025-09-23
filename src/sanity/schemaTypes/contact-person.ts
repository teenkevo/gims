import { defineField, defineType } from "sanity";

export const contactPerson = defineType({
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
      name: "client",
      title: "Client",
      type: "reference",
      to: [{ type: "client" }],
    }),
  ],
  preview: {
    select: {
      name: "name",
      clientName: "client.name",
      email: "email",
    },
    prepare(selection) {
      const { name, clientName, email } = selection;
      return {
        title: `${name} - ${clientName || "No Client"}`,
        subtitle: email,
      };
    },
  },
});
