import { z } from "zod";


// title, description, position, videoUrl, thumbnail, rigIds

export const createVideoZodSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title is required"),
    description: z.string().optional(),
    position: z.string().optional(),
    rigIds: z.array(z.number()).optional(),
    isAllRigs: z.boolean().optional(),
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
