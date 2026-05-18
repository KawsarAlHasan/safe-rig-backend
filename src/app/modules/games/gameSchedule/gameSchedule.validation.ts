import { z } from "zod";

export const puzzleSubmitZodSchema = z.object({
  body: z.object({
    puzzles: z
      .array(
        z.object({
          puzzleId: z
            .number()
            .int()
            .positive("Puzzle ID must be a positive integer"),
          currect: z
            .number()
            .int()
            .nonnegative("Correct count must be non-negative"),
          worng: z
            .number()
            .int()
            .nonnegative("Wrong count must be non-negative"),
        }),
      )
      .min(1, "At least one puzzle is required"),
  }),
});

export const gameScheduleZodSchema = z.object({
  body: z
    .object({
      scheduledFor: z.string().min(1, "Scheduled for is required"),
      gameType: z.enum(["PUZZLE", "QUESTION"]),

      puzzles: z
        .array(
          z.object({
            puzzleId: z.number().positive(),
          }),
        )
        .optional(),

      questions: z
        .array(
          z.object({
            questionId: z.number().positive(),
          }),
        )
        .optional(),
    })
    .refine(
      (data) => {
        if (data.gameType === "PUZZLE") {
          return data.puzzles && data.puzzles.length > 0;
        }
        if (data.gameType === "QUESTION") {
          return data.questions && data.questions.length > 0;
        }
        return true;
      },
      {
        message:
          "At least one puzzle is required for PUZZLE type, and at least one question is required for QUESTION type",
        path: ["gameType"],
      },
    ),
});

export const updateGameScheduleZodSchema = z.object({
  body: z
    .object({
      scheduledFor: z
        .string()
        .datetime()
        .or(z.date())
        .transform((val) => new Date(val))
        .optional(),
      gameType: z.enum(["PUZZLE", "QUESTION"]).optional(),
      puzzleId: z.number().positive().optional().nullable(),
      questionId: z.number().positive().optional().nullable(),
    })
    .refine(
      (data) => {
        if (data.gameType === "PUZZLE" && data.puzzleId === undefined) {
          return false;
        }
        if (data.gameType === "QUESTION" && data.questionId === undefined) {
          return false;
        }
        return true;
      },
      {
        message: "Invalid combination of gameType and Id",
      },
    ),
});
