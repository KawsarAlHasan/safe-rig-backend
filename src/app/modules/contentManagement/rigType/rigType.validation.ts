import { z } from "zod";

export const createRigTypeZodSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name is required"),
    isDefault: z.boolean().optional().default(false),
    companyId: z.number().optional(),
    isAllRigs: z.boolean().optional().default(false),
    rigIds: z.array(z.number()).optional(),
  }),
});
