// ./schemas/revision.ts
import { defineType, defineField } from "sanity";

export const revision = defineType({
  name: "revision",
  title: "Revision",
  type: "document", // <-- changed
  fields: [
    defineField({
      name: "number",
      title: "Revision Number",
      type: "string",
      readOnly: true, // <-- protect the field
      validation: (Rule) =>
        Rule.regex(/^R\d{4}-\d{2}$/).error("Use the format RYYYY‑XX, e.g. R2025‑03"),
    }),

    defineField({ name: "notes", title: "Change Notes", type: "text" }),
  ],

  // fires once when the user clicks “New”
  initialValue: async (_params, { getClient }) => {
    const client = getClient({ apiVersion: "2025-05-06" });
    const year = new Date().getFullYear();
    const count = await client.fetch(`count(*[_type == "revision" && number match $p])`, {
      p: `R${year}-??`,
    });
    const seq = String(count + 1).padStart(2, "0");
    return { number: `R${year}-${seq}` };
  },
});
