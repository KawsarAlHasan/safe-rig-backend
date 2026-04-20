import { z } from "zod";

export const createCardSubmissionZodSchema = z.object({
  body: z.object({
    cardTypeId: z.number().min(1, "Card type is required"),
    areaId: z.number().min(1, "Area is required"),
    hazardId: z.number().min(1, "Hazard is required"),

    description: z.string().min(1, "Description is required"),

    riskSeverity: z.enum(["LOW", "MEDIUM", "HIGH"]),

    file: z.string().optional(),

    actionTaken: z.boolean().optional().default(false),
    immediateAction: z.boolean().optional().default(false),
    submitAnonymously: z.boolean().optional().default(false),
  }),
});
