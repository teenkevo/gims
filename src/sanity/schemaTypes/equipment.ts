import { defineField, defineType } from "sanity";

export const equipment = defineType({
  name: "equipment",
  type: "document",
  title: "Equipment",
  fields: [
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
      title: "User Manuals (URLs)",
      of: [{ type: "url" }],
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
