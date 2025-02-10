import { z } from "zod";

export const projectDetailsSchema = z.object({
  projectName: z.string().trim().min(1, "Required"),
  dateRange: z
    .object(
      {
        from: z.date(),
        to: z.date(),
      },
      {
        required_error: "Please select a date range",
      }
    )
    .refine((data) => data.from < data.to, {
      path: ["dateRange"],
      message: "From date must be before to date",
    }),
  priority: z.string(),
});

export const clientDetailsSchema = z.object({
  clientType: z.enum(["new", "existing"], {
    required_error: "Required",
  }),
  existingClient: z.string().optional(),
  newClientName: z.string().min(1, "Required").optional().or(z.literal("")),
});

export const billingFormSchema = z.object({
  billingType: z.enum(["quotation", "invoice"], {
    required_error: "You need to select a type.",
  }),
  totalBill: z.coerce
    .number()
    .optional()
    .refine((val) => val !== undefined, {
      message:
        "Total is automatically computed after adding all required billing items",
    }),
});

export const createPartialBillFormSchema = (
  totalBill: number | undefined,
  endDate: Date | undefined,
  startDate: Date | undefined
) => {
  return z
    .object({
      partialBillToggle: z.boolean(),
      partialBill: z.number().optional(),
      partialBillDueDate: z.date().optional(),
    })
    .refine(
      (data) => {
        if (data.partialBillToggle && data.partialBill === undefined) {
          return false; // Validation fails if partialBill or partialBillDueDate is undefined
        }
        return true; // Validation passes if partialBillToggle is false or if all conditions are met
      },
      {
        message: "Please specify the required upfront amount",
        path: ["partialBill"],
      }
    )
    .refine(
      (data) => {
        if (
          data.partialBillToggle &&
          data.partialBill !== undefined &&
          totalBill !== undefined &&
          data.partialBill > totalBill
        ) {
          return false;
        }
        return true;
      },
      {
        message: "Must be less than the total bill",
        path: ["partialBill"],
      }
    )
    .refine(
      (data) => {
        if (data.partialBillToggle && data.partialBillDueDate === undefined) {
          return false; // Validation fails if partialBill or partialBillDueDate is undefined
        }
        return true; // Validation passes if partialBillToggle is false or if all conditions are met
      },
      {
        message: "Please specify the due date",
        path: ["partialBillDueDate"],
      }
    )
    .refine(
      (data) => {
        if (!data.partialBillToggle) {
          return true; // Validation passes if partialBillToggle is false
        }

        if (
          data.partialBillDueDate !== undefined &&
          startDate !== undefined &&
          endDate !== undefined &&
          data.partialBillDueDate <= startDate &&
          data.partialBillDueDate >= endDate
        ) {
          return true; // Validation passes if partialBillDueDate is between project start and end dates
        }

        return false; // Validation fails if conditions are not met
      },
      {
        message: "Must be between the project start and end dates",
        path: ["partialBillDueDate"],
      }
    );
};

// Updated Create Project Schema: Supports multiple clients
export const createProjectSchema = projectDetailsSchema
  .merge(
    z.object({
      clients: z
        .array(clientDetailsSchema)
        .min(1, "At least one client is required"),
    })
  )
  .refine(
    (data) => {
      // console.log(data.clients);
      return data.clients.every((client) => {
        if (
          client.clientType === "new" &&
          (client.newClientName === undefined || client.newClientName === "")
        ) {
          return false;
        }
        return true;
      });
    },
    {
      message: "Please enter the client name for new clients",
      path: ["clients"],
    }
  )
  .refine(
    (data) => {
      return data.clients.every((client) => {
        if (client.clientType === "existing" && !client.existingClient) {
          return false;
        }
        return true;
      });
    },
    {
      message: "Please select an existing client",
      path: ["clients"],
    }
  );
