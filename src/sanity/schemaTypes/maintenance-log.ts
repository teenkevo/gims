import { Cog } from "lucide-react";
import { defineField, defineType } from "sanity";

export const maintenanceLog = defineType({
  name: "maintenanceLog",
  type: "document",
  title: "Maintenance Logs",
  fields: [
    defineField({
      name: "equipment",
      type: "reference",
      to: [{ type: "equipment" }],
      title: "Equipment",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      type: "datetime",
      title: "Maintenance Date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "supervisedBy",
      type: "reference",
      to: [{ type: "personnel" }],
      title: "Supervised By",
    }),
    defineField({
      name: "maintenanceType",
      type: "string",
      title: "Maintenance Type",
      options: {
        list: [
          { title: "Routine Check", value: "routine" },
          { title: "Repair", value: "repair" },
          { title: "Calibration", value: "calibration" },
          { title: "Replacement", value: "replacement" },
        ],
      },
      initialValue: "routine",
    }),
    defineField({
      name: "maintenanceNotes",
      type: "text",
      title: "Maintenance Notes",
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
  preview: {
    select: {
      equipment: "equipment.name",
      date: "date",
      supervisedBy: "supervisedBy.fullName",
      maintenanceType: "maintenanceType",
      maintenanceNotes: "maintenanceNotes",
      maintenanceCompany: "maintenanceCompany.companyName",
    },
    prepare(selection) {
      const { equipment, date, maintenanceType } = selection;

      const maintenanceTypes = {
        routine: { title: "Routine Check", value: "routine" },
        repair: { title: "Repair", value: "repair" },
        calibration: { title: "Calibration", value: "calibration" },
        replacement: { title: "Replacement", value: "replacement" },
      } as const;

      type MaintenanceTypeKey = keyof typeof maintenanceTypes;

      const type = maintenanceTypes[maintenanceType as MaintenanceTypeKey] || {
        title: "Unknown Maintenance Type",
        icon: Cog,
      };

      return {
        title: equipment,
        subtitle: `${type.title} - ${new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })}`,
      };
    },
  },
});
