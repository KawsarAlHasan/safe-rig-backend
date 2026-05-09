import { z } from "zod";

export const createDailyDebriefZodSchema = z.object({
  body: z.object({
    activityId: z.number().min(1, "Activity is required"),
    typeOfDevriefId: z.number().min(1, "Type of debrief is required"),

    whatHappend: z.string().optional(),
    whatWorkedWell: z.string().optional(),
    whatImproved: z.string().optional(),

    submitAnonymously: z.boolean().optional().default(false),
    submitDay: z.string().optional(),
  }),
});
