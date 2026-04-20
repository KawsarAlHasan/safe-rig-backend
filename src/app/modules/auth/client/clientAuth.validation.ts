import { z } from "zod";
import { statusName } from "../../../../shared/statusName";

export const loginZodSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(1, "Password is required")
  }),
});

export const updateAdminZodSchema = z.object({
  body: z.object({
    id: z.number().min(1, "Id is required"),
    name: z.string().min(1, "Name is required"),
    roleId: z.number().min(1, "Role is required"),
  }),
});

export const updateAdminStatusZodSchema = z.object({
  body: z.object({
    id: z.number().min(1, "Id is required"),
    status: z.enum(statusName).refine((val) => val !== undefined, {
      message: "Status is required",
    }),
  }),
});
