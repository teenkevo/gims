import { defineField, defineType } from "sanity";
import { otherItem, serviceItem } from "./billing-item";

export const quotation = defineType({
  name: "quotation",
  title: "Quotations",
  type: "document",
  fields: [
    defineField({
      name: "quotationNumber",
      title: "Quotation Number",
      type: "string",
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "revisionNumber",
      title: "Revision Number",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "acquisitionNumber",
      title: "Acquisition Number",
      type: "string",
      readOnly: true,
    }),

    defineField({
      name: "quotationDate",
      title: "Quotation Date",
      type: "datetime",
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "currency",
      title: "Choose a currency",
      type: "string",
      options: {
        list: [
          { title: "USD", value: "usd" },
          { title: "EUR", value: "eur" },
          { title: "GBP", value: "gbp" },
          { title: "UGX", value: "ugx" },
        ],
      },
      initialValue: "ugx",
    }),

    defineField({
      name: "items",
      title: "Quotation Services (Lab and Field)",
      type: "array",
      of: [{ type: serviceItem.name }],
      validation: (Rule) =>
        Rule.unique()
          .min(1)
          .custom(async (items, context) => {
            if (!items) return true;
            const serviceIds = items.map((item: any) => item.service?._ref);
            const uniqueServiceIds = new Set(serviceIds);
            if (serviceIds.length !== uniqueServiceIds.size) {
              // Find the duplicate service ID
              const duplicateId = serviceIds.find(
                (id, index) => serviceIds.indexOf(id) !== index
              );
              // Fetch the service details
              const client = context.getClient({ apiVersion: "2025-05-06" });
              const service = await client.fetch(`*[_id == $id][0]`, {
                id: duplicateId,
              });
              return `Service "${service.code}" can only be added once to the quotation`;
            }
            return true;
          }),
    }),
    defineField({
      name: "otherItems",
      title: "Quotation Services (Reporting and Mobilization)",
      type: "array",
      of: [{ type: otherItem.name }],
    }),
    defineField({
      name: "vatPercentage",
      title: "VAT Percentage",
      type: "number",
      initialValue: 18,
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: "paymentNotes",
      title: "Payment Notes",
      type: "text",
    }),
    defineField({
      name: "advance",
      title: "Advance Percentage",
      type: "number",
      initialValue: 60,
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: "payments",
      title: "Payments",
      type: "array",
      of: [
        {
          type: "object",
          name: "paymentItem",
          fields: [
            defineField({
              name: "paymentMode",
              title: "Payment Mode",
              type: "string",
              options: {
                list: ["mobile", "bank", "cash"],
              },
            }),
            defineField({
              name: "amount",
              title: "Amount",
              type: "number",
            }),
            defineField({
              name: "paymentProof",
              title: "Payment Proof",
              type: "file",
              options: {
                accept: "image/*,application/pdf",
              },
            }),
            defineField({
              name: "notes",
              title: "Notes",
              type: "text",
            }),
            // Approved,rejected,pending
            defineField({
              name: "status",
              title: "Status",
              type: "string",
              options: {
                list: ["approved", "rejected", "pending"],
              },
              initialValue: "pending",
            }),
          ],
          preview: {
            select: {
              paymentMode: "paymentMode",
              amount: "amount",
            },
            prepare({ paymentMode, amount }) {
              const label =
                typeof paymentMode === "string" && paymentMode.length
                  ? paymentMode.charAt(0).toUpperCase() + paymentMode.slice(1)
                  : "Unknown";

              const formatted =
                typeof amount === "number"
                  ? amount.toLocaleString()
                  : (amount ?? 0);

              return {
                title: `${label} - ${formatted}`,
              };
            },
          },
        },
      ],
    }),

    defineField({
      name: "revisions",
      title: "Revisions",
      type: "array",
      of: [{ type: "reference", to: [{ type: "quotation" }] }],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: "file",
      type: "file",
      title: "File",
      options: {
        accept: "application/pdf",
      },
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          "draft",
          "sent",
          "accepted",
          "rejected",
          "invoiced",
          "partially_paid",
          "fully_paid",
        ],
      },
      initialValue: "draft",
    }),
    defineField({
      name: "rejectionNotes",
      title: "Rejection Notes",
      type: "text",
    }),
    defineField({
      name: "invoice",
      type: "file",
      title: "Invoice",
      options: {
        accept: "application/pdf",
      },
    }),
  ],
  // Initial value template to seed the first revision
  initialValue: () => {
    const year = new Date().getFullYear();
    return {
      revisions: [
        {
          number: `R${year}-00`,
          date: new Date().toISOString().substr(0, 10),
          notes:
            "This revision is automatically created when the quotation is created.",
        },
      ],
    };
  },
});
