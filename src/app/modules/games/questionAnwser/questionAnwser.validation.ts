import { z } from "zod";

export const createQuestionZodSchema = z.object({
  body: z.object({
    question: z.string().min(1, "Question is required"),
    option1: z.string().min(1, "option1 is required"),
    option2: z.string().min(1, "option2 is required"),
    option3: z.string().min(1, "option3 is required"),
    option4: z.string().min(1, "option4 is required"),
    // correctAnswer: z.coerce().min(1, "correctAnswer is required"),
    // time: z.coerce().min(1, "time is required"),
  }),
});

export const updateQuestionZodSchema = z.object({
  body: z.object({
    id: z.number().min(1, "Id is required"),
    name: z.string().optional(),
    isDefault: z.boolean().optional(),
    companyId: z.number().optional(),
    isAllRigs: z.boolean().optional(),
    rigIds: z.array(z.number()).optional(),
  }),
});

export const changeStatusZodSchema = z.object({
  body: z.object({
    id: z.number().min(1, "Id is required"),
    status: z.string().min(1, "Status is required"),
  }),
});
