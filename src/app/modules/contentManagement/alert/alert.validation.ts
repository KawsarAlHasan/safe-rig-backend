import { z } from "zod";

// title, description, file, isAllRigs, rigIds

export const createAlertZodSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title is required"),
    description: z.string().optional(),
    companyId: z.number().optional(),
    isAllRigs: z.boolean().optional().default(false),
    rigIds: z.array(z.number()).optional(),
  }),
});

export const updateRigTypeZodSchema = z.object({
  body: z.object({
    id: z.number().min(1, "Id is required"),
    name: z.string().optional(),
    isDefault: z.boolean().optional(),
    companyId: z.number().optional(),
    isAllRigs: z.boolean().optional(),
    rigIds: z.array(z.number()).optional(),
  }),
});
