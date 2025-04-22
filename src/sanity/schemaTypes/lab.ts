import { defineField, defineType } from "sanity";

export const lab = defineType({
  name: "lab",
  type: "document",
  title: "Laboratory",
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Lab Name",
      validation: (Rule) => Rule.required(),
    }),
    // TODO: Allow on-demand creation of lab types
    defineField({
      name: "labSection",
      type: "string",
      title: "Lab Section",

      options: {
        list: [
          { title: "Soil Testing", value: "soil_testing" },
          { title: "Rock Testing", value: "rock_testing" },
          { title: "Seismic Testing", value: "seismic_testing" },
          { title: "Asphalt Lab", value: "asphalt_lab" },
          { title: "Concrete Testing", value: "concrete_testing" },
          { title: "General Materials Lab", value: "general_materials" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      type: "string",
      title: "Lab Status",
      options: {
        list: [
          { title: "Available", value: "available" },
          { title: "Under Maintenance", value: "under_maintenance" },
          { title: "Retired", value: "retired" },
          { title: "Full Capacity", value: "fullCapacity" },
        ],
      },
      initialValue: "available",
    }),
    defineField({
      name: "location",
      type: "string",
      title: "Location",
      description: "Lab address or location within the facility",
    }),
    defineField({
      name: "capacity",
      type: "number",
      title: "Capacity (No. of Workstations)",
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "personnel",
      type: "array",
      title: "Assigned Personnel",
      of: [{ type: "reference", to: [{ type: "personnel" }] }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "labHead",
      type: "reference",
      to: [{ type: "personnel" }],
      title: "Lab Head",
      description: "Must be selected from assigned personnel",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "equipment",
      type: "array",
      title: "Equipment",
      of: [{ type: "reference", to: [{ type: "equipment" }] }],
    }),
    defineField({
      name: "projects",
      type: "array",
      title: "Assigned Projects",
      of: [{ type: "reference", to: [{ type: "project" }] }],
    }),
    defineField({
      name: "sopDocuments",
      type: "array",
      title: "SOP Documents",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "category",
              type: "string",
              title: "Category",
              options: {
                list: [
                  { title: "Health & Safety", value: "health_safety" },
                  { title: "Evacuation Protocols", value: "evacuation" },
                  {
                    title: "Quality Control Procedures",
                    value: "quality_control",
                  },
                  { title: "Equipment Handling", value: "equipment_handling" },
                  { title: "General Operations", value: "general_operations" },
                ],
              },
            }),
            defineField({
              name: "documentUrl",
              type: "url",
              title: "Document URL",
            }),
            defineField({
              name: "description",
              type: "text",
              title: "Description",
            }),
          ],
        },
      ],
    }),
  ],
});

// SOIL TESTING LAB
// // PSD,
// // Atterberg Limits,
// // Compaction,
// // Geotechnics
// // Chemical Tests

// AGGREGATES AND CONCRETE TESTING LAB
// // PSD
// // Atterberg Limits
// // Mechanical Tests
// // Chemical Tests
// // Petrology

// ASPHALT AND BITUMEN LAB
// // Asphalt Tests
// // Bitumen Tests
// // Emulsion Tests

// GEOTECHNICAL LAB
// // DCP
// // DPL
// // Rotary Drilling
// // Hand Augering
// // Test pits

// ROLE SETS SHOULD COME FROM ORGANOGRAM

// DEPARTMENTS SHOULD ALSO HAVE MANAGEMENT

// MULTIPLE DEPARTMENTS PER PERSON IF POSSIBLE
