import { z } from "zod";
import { statusName } from "../../../shared/statusName";

export const createAdminZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    // roleId: z.number().min(1, "Role is required"),
    roleName: z.string().min(1, "Role is required"),
  }),
});

export const updateAdminZodSchema = z.object({
  body: z.object({
    id: z.number().min(1, "Id is required"),
    name: z.string().min(1, "Name is required"),
    // roleId: z.number().min(1, "Role is required"),
    roleName: z.string().min(1, "Role is required"),
  }),
});
