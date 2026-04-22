import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../../../generated/prisma/client";
import bcrypt from "bcrypt";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";
import config from "../../../../config";
import { statusName } from "../../../../shared/statusName";
import { IQuery } from "../../../../types/company";

// await dbClient.gameSchedule.deleteMany({});
// await dbClient.gameSchedulePuzzle.deleteMany({});
// await dbClient.gameScheduleQuestion.deleteMany({});

// save game schedule
export const saveGameScheduleService = async (payload: any) => {
  const { scheduledFor, gameType, questions, puzzles } = payload;

  // save game schedule
  const result = await dbClient.gameSchedule.create({
    data: {
      scheduledFor,
      gameType,
      questions: {
        create: questions,
      },
    },
  });

  // check company creation
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to save game schedule!",
    );
  }

  return result;
};

// get game schedule by scheduledFor
export const getGameScheduleService = async () => {
  const today = new Date();
  const dateOnly = today.toISOString().split("T")[0];

  // get game schedule
  const todaysGame = await dbClient.gameSchedule.findFirst({
    where: { scheduledFor: dateOnly },
    include: {
      questions: {
        include: {
          questionAnwser: true,
        },
      },
      puzzles: {
        include: {
          puzzle: true,
        },
      },
    },
  });

  const formatted = {
    ...todaysGame,
    questions: todaysGame?.questions?.map((q) => q.questionAnwser),
    puzzles: todaysGame?.puzzles?.map((p) => p.puzzle),
  };

  return formatted;
};

// question submit
// question submit service
export const questionSubmitService = async (payload: {
  answer: { questionId: number; correctAnswer: number }[];
}) => {
  const { answer } = payload;

  const today = new Date();
  const dateOnly = today.toISOString().split("T")[0];

  const todaySchedule = await dbClient.gameSchedule.findFirst({
    where: {
      scheduledFor: dateOnly,
      gameType: "QUESTION",
    },
    include: {
      questions: {
        include: {
          questionAnwser: true,
        },
      },
    },
  });

  if (!todaySchedule) {
    return {
      success: false,
      message: "No game schedule found for today",
      result: null,
    };
  }

  const results = [];
  let totalScore = 0;
  let totalQuestions = todaySchedule.questions.length;

  for (const submitted of answer) {
    const scheduleQuestion = todaySchedule.questions.find(
      (sq) => sq.questionId === submitted.questionId,
    );

    if (!scheduleQuestion || !scheduleQuestion.questionAnwser) {
      results.push({
        questionId: submitted.questionId,
        status: "not_found",
        message: "This question does not exist in today's game schedule",
        isCorrect: false,
        score: 0,
      });
      continue;
    }

    const questionData = scheduleQuestion.questionAnwser;
    const isCorrect = questionData.correctAnswer === submitted.correctAnswer;

    if (isCorrect) {
      totalScore += questionData.time;
    }

    results.push({
      questionId: submitted.questionId,
      userAnswer: submitted.correctAnswer,
      correctAnswer: questionData.correctAnswer,
      isCorrect,
      score: isCorrect ? questionData.time : 0,
      timeLimit: questionData.time,
    });
  }

  if (answer.length === 0) {
    return {
      success: true,
      message: "Any question is not submitted",
      result: {
        totalQuestions,
        attempted: 0,
        totalScore: 0,
        details: [],
      },
    };
  }

  return {
    scheduleId: todaySchedule.id,
    scheduledFor: todaySchedule.scheduledFor,
    totalQuestions,
    attempted: answer.length,
    totalScore,
    maxPossibleScore: todaySchedule.questions.reduce(
      (sum, q) => sum + (q.questionAnwser?.time || 0),
      0,
    ),
    details: results,
  };
};
