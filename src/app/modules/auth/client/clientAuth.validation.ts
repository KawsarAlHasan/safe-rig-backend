import { z } from "zod";
import { statusName } from "../../../../shared/statusName";

export const loginZodSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
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

export const companyZodSchema = z.object({
  body: z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Name is required"),
    email: z.string().optional(),
    phone: z.string().optional(),
    clientName: z.string().optional(),
    clientEmail: z.string().optional(),
    clientPassword: z.string().optional(),
  }),
});

export const signupZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    entryCompany: z.string().min(1, "Entry Company is required"),
    position: z.string().min(1, "Position is required"),
    phone: z.string().min(1, "Phone is required"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
  }),
});

export const verifyEmailZodSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    otp: z.number().min(1, "OTP is required"),
  }),
});

export const resendCodeZodSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
  }),
});

export const setPasswordZodSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    otp: z.number().min(1, "OTP is required"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
  }),
});
