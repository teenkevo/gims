import { defineField, defineType } from "sanity";

export const lab = defineType({
  name: "lab",
  type: "document",
  title: "Laboratory",
  preview: {
    select: {
      title: "name",
      subtitle: "internalId",
      section: "labSection",
      status: "status",
    },
    prepare({ title, subtitle, section, status }) {
      const sectionLabels: Record<string, string> = {
        soil_testing: "Soil Testing",
        rock_testing: "Rock Testing",
        seismic_testing: "Seismic Testing",
        asphalt_lab: "Asphalt Lab",
        concrete_testing: "Concrete Testing",
        general_materials: "General Materials",
      };
      return {
        title: title || "Untitled Lab",
        subtitle: [subtitle, sectionLabels[section] || section, status]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
  fields: [
    defineField({
      name: "internalId",
      type: "string",
      title: "Lab ID",
      description: "Internal identifier for the laboratory (e.g. LAB-10001)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "name",
      type: "string",
      title: "Lab Name",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      description: "Brief overview of the laboratory's scope and responsibilities",
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
      name: "accreditation",
      type: "object",
      title: "Accreditation",
      description: "ISO 17025 or equivalent laboratory accreditation details",
      fields: [
        defineField({
          name: "standard",
          type: "string",
          title: "Accreditation Standard",
          initialValue: "ISO 17025",
        }),
        defineField({
          name: "certificateNumber",
          type: "string",
          title: "Certificate Number",
        }),
        defineField({
          name: "accreditingBody",
          type: "string",
          title: "Accrediting Body",
          description: "e.g. UNBS, SANAS, UKAS",
        }),
        defineField({
          name: "expiryDate",
          type: "date",
          title: "Expiry Date",
        }),
      ],
    }),
    defineField({
      name: "testCapabilities",
      type: "array",
      title: "Test Capabilities",
      description: "Catalogued test methods this laboratory is accredited to perform",
      of: [{ type: "reference", to: [{ type: "service" }] }],
    }),
    defineField({
      name: "notes",
      type: "text",
      title: "Operational Notes",
      description: "Operating hours, access restrictions, or other operational details",
    }),
    defineField({
      name: "personnel",
      type: "array",
      title: "Assigned Personnel",
      of: [{ type: "reference", to: [{ type: "personnel" }] }],
    }),
    defineField({
      name: "labHead",
      type: "reference",
      to: [{ type: "personnel" }],
      title: "Lab Head",
      description: "Must be selected from assigned personnel",
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
