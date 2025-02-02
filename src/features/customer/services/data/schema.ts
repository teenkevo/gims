import { z } from "zod";

export const serviceSchema = z.object({
  id: z.string(),
  code: z.string(),
  test_parameter: z.string(),
  test_methods: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      code: z.string(),
      selected: z.boolean().optional(),
    })
  ),
  sample_class: z.string(),
  status: z.string(),
  price: z.number().optional(),
  quantity: z.number().optional(),
});

export const fieldServiceSchema = z.object({
  id: z.string(),
  code: z.string(),
  test_parameter: z.string(),
  test_method: z.string(),
  sample_class: z.string(),
  status: z.string(),
  price: z.number().optional(),
  quantity: z.number().optional(),
});

export const mobilizationServiceSchema = z.object({
  activity: z.string(),
  price: z.number().optional(),
  quantity: z.number().optional(),
  // might need to scale up
});

export const reportingServiceSchema = z.object({
  activity: z.string(),
  price: z.number().optional(),
  quantity: z.number().optional(),
});

export type ReportingService = z.infer<typeof reportingServiceSchema>;

export type FieldService = z.infer<typeof fieldServiceSchema>;

export type MobilizationService = z.infer<typeof mobilizationServiceSchema>;

export type Service = z.infer<typeof serviceSchema>;
