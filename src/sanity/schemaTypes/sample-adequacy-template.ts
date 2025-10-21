import { defineField, defineType } from "sanity";

export const sampleAdequacyTemplate = defineType({
  name: "sampleAdequacyTemplate",
  title: "Sample Adequacy Templates",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Template Name",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "e.g., 'Standard Sample Adequacy Checklist'",
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
      name: "adequacyChecks",
      title: "Adequacy Checks",
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
              title: "Requirement",
              type: "text",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "required",
              title: "Required",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "category",
              title: "Category",
              type: "string",
              options: {
                list: [
                  {
                    title: "Sample Identification",
                    value: "sample_identification",
                  },
                  { title: "Sample Condition", value: "sample_condition" },
                  { title: "Documentation", value: "documentation" },
                  {
                    title: "Testing Requirements",
                    value: "testing_requirements",
                  },
                  { title: "Compliance", value: "compliance" },
                  { title: "Other", value: "other" },
                ],
              },
            }),
            defineField({
              name: "helpText",
              title: "Help Text",
              type: "text",
              description: "Additional guidance for this requirement",
            }),
          ],
          preview: {
            select: {
              label: "label",
              category: "category",
              required: "required",
            },
            prepare(selection) {
              const { label, category, required } = selection;
              return {
                title:
                  label?.substring(0, 60) + (label?.length > 60 ? "..." : ""),
                subtitle: `${category || "No category"}${required ? " (Required)" : " (Optional)"}`,
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
