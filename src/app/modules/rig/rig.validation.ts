import { z } from "zod";

export const createRigZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    location: z.string().min(1, "Location is required"),
    latitude: z.string().min(1, "Latitude is required"),
    longitude: z.string().min(1, "Longitude is required"),
    rigTypeId: z.number().min(1, "rigTypeId is required"),
    companyId: z.number().optional(),
  }),
});

export const updateRigZodSchema = z.object({
  body: z.object({
    id: z.number().min(1, "Id is required"),
    name: z.string().optional(),
    location: z.string().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    rigTypeId: z.number().optional(),
    companyId: z.number().optional(),
    status: z.string().optional(),
  }),
});
