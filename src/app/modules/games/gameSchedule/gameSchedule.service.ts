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

  // delete game schedule
  await dbClient.game.deleteMany({
    where: {
      scheduledFor,
    },
  });

  // save game schedule
  const result = await dbClient.game.create({
    data: {
      scheduledFor,
      gameType,
      questionIds: questions,
      puzzleIds: puzzles,
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
export const getGameScheduleForAdminService = async (dateQuery: any) => {
  const today = new Date();
  let dateOnly: any;

  if (dateQuery) {
    dateOnly = dateQuery;
  } else {
    dateOnly = today.toISOString().split("T")[0];
  }

  // get game schedule
  const todaysGame = await dbClient.game.findFirst({
    where: { scheduledFor: dateOnly },
  });

  if (!todaysGame) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Game schedule doesn't exist!");
  }

  let questions: any = [];
  let puzzles: any = [];

  if (todaysGame?.gameType === "QUESTION") {
    const result = await dbClient.questionAnwser.findMany({
      where: {
        id: {
          in: todaysGame.questionIds,
        },
      },
    });

    questions = result;
  } else {
    const result = await dbClient.puzzle.findMany({
      where: {
        id: {
          in: todaysGame.puzzleIds,
        },
      },
    });

    puzzles = result;
  }

  const formatted = {
    id: todaysGame.id,
    scheduledFor: todaysGame.scheduledFor,
    gameType: todaysGame.gameType,
    createdAt: todaysGame.createdAt,
    updatedAt: todaysGame.updatedAt,
    questions: questions,
    puzzles: puzzles,
  };

  return formatted;
};

// get game schedule by scheduledFor
export const getGameScheduleService = async (user: any) => {
  const today = new Date();
  const dateOnly = today.toISOString().split("T")[0];

  // // check game result
  // const gameResult = await dbClient.gameResult.findFirst({
  //   where: {
  //     userId: user.id,
  //     date: dateOnly,
  //   },
  // });

  // if (gameResult) {
  //   throw new ApiError(StatusCodes.BAD_REQUEST, "This Game already played!");
  // }

  // get game schedule
  const todaysGame = await dbClient.game.findFirst({
    where: { scheduledFor: dateOnly },
  });

  if (!todaysGame) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Game schedule doesn't exist!");
  }

  let questions: any = [];
  let puzzles: any = [];

  if (todaysGame?.gameType === "QUESTION") {
    const result = await dbClient.questionAnwser.findMany({
      where: {
        id: {
          in: todaysGame.questionIds,
        },
      },
    });

    questions = result;
  } else {
    const result = await dbClient.puzzle.findMany({
      where: {
        id: {
          in: todaysGame.puzzleIds,
        },
      },
    });

    // Parse marks from string to JSON
    const puzzlesWithParsedMarks = result.map((puzzle: any) => ({
      ...puzzle,
      marks: JSON.parse(puzzle.marks), // Convert string to array
    }));

    puzzles = puzzlesWithParsedMarks;
  }

  const formatted = {
    id: todaysGame.id,
    scheduledFor: todaysGame.scheduledFor,
    gameType: todaysGame.gameType,
    createdAt: todaysGame.createdAt,
    updatedAt: todaysGame.updatedAt,
    questions: questions,
    puzzles: puzzles,
  };

  return formatted;
};

// question submit service
export const questionSubmitService = async (payload: {
  answer: { questionId: number; correctAnswer: number }[];
  user: any;
}) => {
  const { answer, user } = payload;

  const today = new Date();
  const dateOnly = today.toISOString().split("T")[0];

  // // check game result
  // const gameResult = await dbClient.gameResult.findFirst({
  //   where: {
  //     userId: user.id,
  //     date: dateOnly,
  //   },
  // });

  // if (gameResult) {
  //   throw new ApiError(StatusCodes.BAD_REQUEST, "This Game already played!");
  // }

  // get game schedule
  const todaysGame = await dbClient.game.findFirst({
    where: { scheduledFor: dateOnly, gameType: "QUESTION" },
  });

  if (!todaysGame) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Game schedule doesn't exist!");
  }

  // Get all questions for today's game
  const questions = await dbClient.questionAnwser.findMany({
    where: {
      id: {
        in: todaysGame.questionIds,
      },
    },
  });

  // Calculate results
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let score = 0;
  const questionDetails = [];

  // Create a map for quick lookup of correct answers
  const correctAnswersMap = new Map(
    questions.map((q) => [q.id, q.correctAnswer]),
  );

  // Create a map for question details
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  // Evaluate each answer
  for (const userAnswer of answer) {
    const correctAnswer = correctAnswersMap.get(userAnswer.questionId);
    const question = questionMap.get(userAnswer.questionId);

    if (!question) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Question with id ${userAnswer.questionId} not found in today's game`,
      );
    }

    const isCorrect = userAnswer.correctAnswer === correctAnswer;

    // Get option text based on user's answer
    const getUserAnswerText = () => {
      switch (userAnswer.correctAnswer) {
        case 1:
          return question.option1;
        case 2:
          return question.option2;
        case 3:
          return question.option3;
        case 4:
          return question.option4;
        default:
          return "Not answered";
      }
    };

    // Get correct answer text
    const getCorrectAnswerText = () => {
      switch (correctAnswer) {
        case 1:
          return question.option1;
        case 2:
          return question.option2;
        case 3:
          return question.option3;
        case 4:
          return question.option4;
        default:
          return "Not specified";
      }
    };

    // Prepare question details for response
    questionDetails.push({
      id: question.id,
      question: question.question,
      option1: question.option1,
      option2: question.option2,
      option3: question.option3,
      option4: question.option4,
      correctAnswerText: getCorrectAnswerText(),
      userAnswer: userAnswer.correctAnswer,
      userAnswerText: getUserAnswerText(),
      isCorrect: isCorrect,
    });

    if (isCorrect) {
      correctAnswers++;
    } else {
      wrongAnswers++;
    }
  }

  // Calculate score (e.g., each correct answer = 10 points)
  const POINTS_PER_CORRECT_ANSWER = 10;
  score = correctAnswers * POINTS_PER_CORRECT_ANSWER;

  // Check if all questions were answered
  if (answer.length !== questions.length) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Please answer all ${questions.length} questions. You answered only ${answer.length}`,
    );
  }

  const percentage = (correctAnswers / questions.length) * 100;

  const totalScore = questions.length * POINTS_PER_CORRECT_ANSWER;

  // result save to database
  await dbClient.gameResult.create({
    data: {
      userId: user.id,
      date: dateOnly,
      gameType: "QUESTION",
      questionIds: todaysGame.questionIds,
      score: parseFloat(score.toFixed(2)),
      totalScore: parseFloat(totalScore.toFixed(2)),
    },
  });

  return {
    percentage: percentage,
    totalQuestions: questions.length,
    correctAnswers: correctAnswers,
    wrongAnswers: wrongAnswers,
    score: score,
    results: questionDetails,
  };
};

// puzzle submit
export const puzzleSubmitService = async (payload: {
  puzzles: { puzzleId: number; currect: number; worng: number }[];
  user: any;
}) => {
  const { puzzles, user } = payload;

  const today = new Date();
  const dateOnly = today.toISOString().split("T")[0];

  // check game result
  const gameResult = await dbClient.gameResult.findFirst({
    where: {
      userId: user.id,
      date: dateOnly,
    },
  });

  if (gameResult) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "This Game already played!");
  }

  // get game schedule
  const todaysGame = await dbClient.game.findFirst({
    where: { scheduledFor: dateOnly, gameType: "PUZZLE" },
  });

  if (!todaysGame) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Game schedule doesn't exist!");
  }

  // Get all puzzles for today's game
  const dbPuzzles = await dbClient.puzzle.findMany({
    where: {
      id: { in: todaysGame.puzzleIds },
    },
  });

  let totalScore = 0;
  let totalCorrect = 0;
  let totalWrong = 0;
  let totalMissed = 0;
  const puzzleDetails: any[] = [];

  for (const submitted of puzzles) {
    // find puzzle from db
    const dbPuzzle = dbPuzzles.find((p: any) => p.id === submitted.puzzleId);

    if (!dbPuzzle) continue;

    // marks parse
    const marks = JSON.parse(dbPuzzle.marks as string);
    const totalMarksCount = marks.length;

    const correct = submitted.currect ?? 0;
    const wrong = submitted.worng ?? 0;

    const attempted = correct + wrong;
    const missed = Math.max(0, totalMarksCount - attempted);

    const earnedScore = correct * 10;
    const wrongPenalty = wrong * 5;
    const missedPenalty = missed * 5;

    // don't go below 0
    const puzzleScore = Math.max(0, earnedScore - wrongPenalty - missedPenalty);

    totalScore += puzzleScore;
    totalCorrect += correct;
    totalWrong += wrong;
    totalMissed += missed;

    puzzleDetails.push({
      puzzleId: submitted.puzzleId,
      totalMarks: totalMarksCount,
      correct,
      wrong,
      missed,
      earnedScore,
      wrongPenalty,
      missedPenalty,
      puzzleScore,
    });
  }

  // Total possible score
  const totalPossibleScore = dbPuzzles.reduce((sum: number, p: any) => {
    const marks = JSON.parse(p.marks as string);
    return sum + marks.length * 10;
  }, 0);

  // don't go below 0
  const finalScore = Math.max(0, totalScore);

  const percentage =
    totalPossibleScore > 0
      ? parseFloat(((finalScore / totalPossibleScore) * 100).toFixed(2))
      : 0;

  // result save to database
  await dbClient.gameResult.create({
    data: {
      userId: user.id,
      date: dateOnly,
      gameType: "PUZZLE",
      puzzleIds: todaysGame.puzzleIds,
      score: parseFloat(finalScore.toFixed(2)),
      totalScore: parseFloat(totalPossibleScore.toFixed(2)),
    },
  });

  return {
    percentage,
    totalPuzzles: dbPuzzles.length,
    totalCorrect,
    totalWrong,
    totalMissed,
    score: finalScore,
    totalPossibleScore,
    puzzleDetails,
  };
};
// leaderboard service
export const leaderboardService = async (user: any) => {
  // Calculate date range (last Monday to Sunday)
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Calculate last Monday (if today is Monday, get previous Monday)
  let daysToLastMonday = currentDay === 0 ? 6 : currentDay - 1;
  if (daysToLastMonday === 0 && currentDay === 1) {
    daysToLastMonday = 7; // Get previous Monday if today is Monday
  }

  const lastMonday = new Date(now);
  lastMonday.setDate(now.getDate() - daysToLastMonday);
  lastMonday.setHours(0, 0, 0, 0);

  // Calculate last Sunday
  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);
  lastSunday.setHours(23, 59, 59, 999);

  // Get all game results within the date range
  const allResults = await dbClient.gameResult.findMany({
    where: {
      createdAt: {
        gte: lastMonday,
        lte: lastSunday,
      },
    },
    select: {
      userId: true,
      score: true,
    },
  });

  // Aggregate scores by user
  const userScoresMap = new Map<number, number>();

  for (const result of allResults) {
    const currentScore = userScoresMap.get(result.userId) || 0;
    userScoresMap.set(result.userId, currentScore + result.score);
  }

  // Convert to array and sort by score (descending)
  let leaderboard = Array.from(userScoresMap.entries())
    .map(([userId, totalScore]) => ({ userId, totalScore }))
    .sort((a, b) => b.totalScore - a.totalScore);

  // Get top 50 users
  const top50 = leaderboard.slice(0, 50);

  // Get user's rank and score
  let userRank: number | null = null;
  let userTotalScore: number | null = null;

  if (user && user.id) {
    const userScoreEntry = leaderboard.find(
      (entry) => entry.userId === user.id,
    );
    if (userScoreEntry) {
      userTotalScore = userScoreEntry.totalScore;
      userRank = leaderboard.findIndex((entry) => entry.userId === user.id) + 1;
    }
  }

  // Fetch user details for top 50 (optional - add user names, emails, etc.)
  const top50WithUserDetails = await dbClient.user.findMany({
    where: {
      id: {
        in: top50.map((entry) => entry.userId),
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      // Add any other user fields you need
    },
  });

  // Merge user details with scores
  const finalLeaderboard = top50.map((entry) => ({
    ...entry,
    user: top50WithUserDetails.find((u) => u.id === entry.userId),
  }));

  return {
    weekRange: {
      from: lastMonday,
      to: lastSunday,
    },
    currentUser:
      user && user.id
        ? {
            userId: user.id,
            totalScore: userTotalScore || 0,
            rank: userRank || null,
            message: userRank
              ? `Your rank is ${userRank}`
              : "You have no scores this week",
          }
        : null,
    leaderboard: finalLeaderboard,
  };
};
