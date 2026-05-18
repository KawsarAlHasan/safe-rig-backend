import { z } from "zod";

export const clientResendCodeZodSchema = z.object({
  body: z.object({
    client: z.number().min(1, "Client is required"),
    rig: z.number().min(1, "Rig is required"),
  }),
});

export const profileUpdateCodeZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    entryCompany: z.string().optional(),
    position: z.string().optional(),
    phone: z.string().optional(),
  }),
});
