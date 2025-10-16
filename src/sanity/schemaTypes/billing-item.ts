import { defineField, defineType } from "sanity";

export const serviceItem = defineType({
  name: "serviceItem",
  title: "Service Item",
  type: "object",
  fields: [
    defineField({
      name: "service",
      title: "Service",
      type: "reference",
      to: [{ type: "service" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "unit",
      title: "Unit",
      type: "string",
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          { title: "Number", value: "number" },
          { title: "Meters", value: "meters" },
          { title: "Lump sum", value: "lump sum" },
          { title: "Days", value: "days" },
          { title: "Weeks", value: "weeks" },
          { title: "Months", value: "months" },
          { title: "Year", value: "year" },
        ],
      },
      initialValue: "number",
    }),
    defineField({
      name: "unitPrice",
      title: "Unit Price",
      type: "number",
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: "quantity",
      title: "Quantity",
      type: "number",
      initialValue: 1,
      validation: (Rule) => Rule.required().integer().positive(),
    }),

    defineField({
      name: "lineTotal",
      title: "Line Total",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "testMethod",
      title: "Test Method",
      type: "reference",
      to: [{ type: "testMethod" }],
      validation: (Rule) => Rule.required(),
    }),
  ],
  // Automatically compute lineTotal in Studio
  preview: {
    select: {
      title: "service.code",
      testParameter: "service.testParameter",
      price: "unitPrice",
      qty: "quantity",
    },
    prepare({ title, testParameter, price, qty }) {
      return {
        title: `${title} – ${testParameter} – ${qty} × ${price}`,
        subtitle: `Subtotal ${price * qty}`,
      };
    },
  },
});

export const otherItem = defineType({
  name: "otherItem",
  title: "Other Item",
  type: "object",
  fields: [
    defineField({
      name: "type",
      title: "Select activity type",
      type: "string",
      options: {
        list: [
          { title: "Mobilization", value: "mobilization" },
          { title: "Reporting", value: "reporting" },
        ],
      },
      initialValue: "mobilization",
    }),
    defineField({
      name: "activity",
      title: "Activity Description",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "unit",
      title: "Unit",
      type: "string",
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          { title: "Number", value: "number" },
          { title: "Meters", value: "meters" },
          { title: "Lump sum", value: "lump sum" },
          { title: "Days", value: "days" },
          { title: "Weeks", value: "weeks" },
          { title: "Months", value: "months" },
          { title: "Year", value: "year" },
        ],
      },
      initialValue: "number",
    }),
    defineField({
      name: "unitPrice",
      title: "Unit Price",
      type: "number",
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: "quantity",
      title: "Quantity",
      type: "number",
      initialValue: 1,
      validation: (Rule) => Rule.required().integer().positive(),
    }),
    defineField({
      name: "lineTotal",
      title: "Line Total",
      type: "number",
      readOnly: true,
    }),
  ],
  // Automatically compute lineTotal in Studio
  preview: {
    select: {
      type: "type",
      title: "activity",
      price: "unitPrice",
      qty: "quantity",
    },
    prepare({ type, title, price, qty }) {
      return {
        title: `${type?.charAt(0)?.toUpperCase() + type?.slice(1)} – ${title} – ${qty} × ${price}`,
        subtitle: `Subtotal ${price * qty}`,
      };
    },
  },
});
