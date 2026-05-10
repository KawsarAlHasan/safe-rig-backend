import { z } from "zod";

export const createHazardZodSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name is required"),
    isDefault: z.boolean().optional().default(false),
    companyId: z.number().optional(),
    isAllRigs: z.boolean().optional().default(false),
    rigIds: z.array(z.number()).optional(),
  }),
});

export const updateHazardZodSchema = z.object({
  body: z.object({
    id: z.number().min(1, "Id is required"),
    name: z.string().optional(),
    isDefault: z.boolean().optional(),
    companyId: z.number().optional(),
    isAllRigs: z.boolean().optional(),
    rigIds: z.array(z.number()).optional(),
  }),
});
