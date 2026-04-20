import { z } from "zod";

export const createCardTypeZodSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name is required"),
    isDefault: z.boolean().optional().default(false),
    companyId: z.number().optional(),
    isAllRigs: z.boolean().optional().default(false),
    rigIds: z.array(z.number()).optional(),
  }),
});

export const updateCardTypeZodSchema = z.object({
  body: z.object({
    id: z.number().min(1, "Id is required"),
    name: z.string().optional(),
    isDefault: z.boolean().optional(),
    companyId: z.number().optional(),
    isAllRigs: z.boolean().optional(),
    rigIds: z.array(z.number()).optional(),
  }),
});

export const changeStatusZodSchema = z.object({
  body: z.object({
    id: z.number().min(1, "Id is required"),
    status: z.string().min(1, "Status is required"),
  }),
});
