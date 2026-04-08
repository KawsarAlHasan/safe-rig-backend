import { z } from "zod";
import { statusName } from "../../../shared/statusName";

export const createCompanyZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().optional(),
    phone: z.string().optional(),
    clientName: z.string().optional(),
    clientEmail: z.string().optional(),
    clientPassword: z.string().optional(),
  }),
});
