import { defineField, defineType } from "sanity";

export const sampleReviewTemplate = defineType({
  name: "sampleReviewTemplate",
  title: "Sample Review Templates",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Template Name",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "e.g., 'Standard Laboratory Review Template'",
    }),
    defineField({
      name: "version",
      title: "Version",
      type: "string",
      initialValue: "1.0",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description: "Brief description of what this template covers",
    }),
    defineField({
      name: "isActive",
      title: "Active Template",
      type: "boolean",
      initialValue: true,
      description: "Only one template should be active at a time",
    }),
    defineField({
      name: "reviewItems",
      title: "Review Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "id",
              title: "ID",
              type: "number",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "label",
              title: "Review Point",
              type: "text",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "category",
              title: "Category",
              type: "string",
              options: {
                list: [
                  { title: "Test Method", value: "test_method" },
                  { title: "Laboratory Capability", value: "lab_capability" },
                  { title: "Sample Adequacy", value: "sample_adequacy" },
                  {
                    title: "Customer Requirements",
                    value: "customer_requirements",
                  },
                  { title: "Compliance", value: "compliance" },
                  { title: "Other", value: "other" },
                ],
              },
            }),
            defineField({
              name: "isRequired",
              title: "Required",
              type: "boolean",
              initialValue: true,
              description: "Whether this review point is mandatory",
            }),
          ],
          preview: {
            select: {
              label: "label",
              category: "category",
              isRequired: "isRequired",
            },
            prepare(selection) {
              const { label, category, isRequired } = selection;
              return {
                title:
                  label?.substring(0, 60) + (label?.length > 60 ? "..." : ""),
                subtitle: `${category || "No category"}${isRequired ? " (Required)" : " (Optional)"}`,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      name: "name",
      version: "version",
      isActive: "isActive",
    },
    prepare(selection) {
      const { name, version, isActive } = selection;
      return {
        title: name,
        subtitle: `v${version}${isActive ? " (Active)" : " (Inactive)"}`,
      };
    },
  },
});
