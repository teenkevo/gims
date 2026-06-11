import { defineField, defineType } from "sanity";

export const equipment = defineType({
  name: "equipment",
  type: "document",
  title: "Equipment",
  preview: {
    select: {
      title: "name",
      subtitle: "internalId",
      serial: "serialNumber",
      status: "status",
    },
    prepare({ title, subtitle, serial, status }) {
      return {
        title: title || "Untitled Equipment",
        subtitle: [subtitle, serial, status].filter(Boolean).join(" · "),
      };
    },
  },
  fields: [
    defineField({
      name: "internalId",
      type: "string",
      title: "Equipment ID",
      description: "Internal asset identifier (e.g. EQ-10001)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "name",
      type: "string",
      title: "Equipment Name",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "serialNumber",
      type: "string",
      title: "Serial Number",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      type: "string",
      title: "Equipment Category",
      options: {
        list: [
          { title: "Compression / Strength", value: "compression_testing" },
          { title: "Sieving & Grading", value: "sieving_grading" },
          { title: "Moisture & Density", value: "moisture_density" },
          { title: "Triaxial & Shear", value: "triaxial_shear" },
          { title: "Consolidation", value: "consolidation" },
          { title: "Rock Mechanics", value: "rock_mechanics" },
          { title: "Calibration Standard", value: "calibration_standard" },
          { title: "Field Instrument", value: "field_instrument" },
          { title: "General Laboratory", value: "general_lab" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "manufacturer",
      type: "string",
      title: "Manufacturer",
    }),
    defineField({
      name: "model",
      type: "string",
      title: "Model",
    }),
    defineField({
      name: "notes",
      type: "text",
      title: "Notes",
      description: "Operating notes, calibration requirements, or limitations",
    }),
    defineField({
      name: "status",
      type: "string",
      title: "Status",
      options: {
        list: [
          { title: "Available", value: "available" },
          { title: "In Use", value: "in_use" },
          { title: "Under Maintenance", value: "under_maintenance" },
          { title: "Retired", value: "retired" },
        ],
      },
      initialValue: "available",
    }),
    defineField({
      name: "lastMaintenance",
      type: "date",
      title: "Last Maintenance Date",
    }),
    defineField({
      name: "nextMaintenance",
      type: "date",
      title: "Next Maintenance Due",
    }),

    defineField({
      name: "assignedPersonnel",
      type: "array",
      title: "Assigned Personnel",
      of: [{ type: "reference", to: [{ type: "personnel" }] }],
    }),
    defineField({
      name: "userManuals",
      type: "array",
      title: "User Manuals",
      of: [
        {
          type: "file",
          fields: [
            defineField({
              name: "name",
              type: "string",
              title: "Name",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "supplier",
      type: "object",
      title: "Supplier Information",
      fields: [
        defineField({
          name: "name",
          type: "string",
          title: "Supplier Name",
        }),
        defineField({
          name: "contactPerson",
          type: "string",
          title: "Contact Person",
        }),
        defineField({
          name: "contactEmail",
          type: "email",
          title: "Contact Email",
        }),
        defineField({
          name: "contactPhone",
          type: "string",
          title: "Contact Phone",
        }),
      ],
    }),
    defineField({
      name: "maintenanceCompany",
      type: "object",
      title: "Maintenance Company",
      fields: [
        defineField({
          name: "companyName",
          type: "string",
          title: "Company Name",
        }),
        defineField({
          name: "contactPerson",
          type: "string",
          title: "Contact Person",
        }),
        defineField({
          name: "contactEmail",
          type: "email",
          title: "Contact Email",
        }),
        defineField({
          name: "contactPhone",
          type: "string",
          title: "Contact Phone",
        }),
      ],
    }),
  ],
});
