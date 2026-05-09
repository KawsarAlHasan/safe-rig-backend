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

  // Puzzle and QuestionAnwser are change isUsed to true
  if (gameType === "PUZZLE") {
    await dbClient.puzzle.updateMany({
      where: {
        id: {
          in: puzzles,
        },
      },
      data: {
        isUsed: true,
      },
    });
  } else {
    await dbClient.questionAnwser.updateMany({
      where: {
        id: {
          in: questions,
        },
      },
      data: {
        isUsed: true,
      },
    });
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
      marksLength: JSON.parse(puzzle.marks).length,
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
      companyId: user.companyId,
      rigId: user.rigId,
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

  // get today's game
  const todaysGame = await dbClient.game.findFirst({
    where: { scheduledFor: dateOnly, gameType: "PUZZLE" },
  });

  if (!todaysGame) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Game schedule doesn't exist!");
  }

  // get puzzles from DB
  const dbPuzzles = await dbClient.puzzle.findMany({
    where: {
      id: { in: todaysGame.puzzleIds },
    },
  });

  let totalScore = 0;
  let totalCorrect = 0;

  const puzzleDetails: any[] = [];

  for (const submitted of puzzles) {
    const dbPuzzle = dbPuzzles.find((p: any) => p.id === submitted.puzzleId);

    if (!dbPuzzle) continue;

    const correct = submitted.currect ?? 0;

    // ONLY logic: correct * 10
    const puzzleScore = correct * 10;

    totalScore += puzzleScore;
    totalCorrect += correct;

    puzzleDetails.push({
      puzzleId: submitted.puzzleId,
      correct,
      puzzleScore,
    });
  }

  // total possible score (optional)
  const totalPossibleScore = dbPuzzles.reduce((sum: number, p: any) => {
    const marks = JSON.parse(p.marks as string);
    return sum + marks.length * 10;
  }, 0);

  // save result
  await dbClient.gameResult.create({
    data: {
      userId: user.id,
      companyId: user.companyId,
      rigId: user.rigId,
      date: dateOnly,
      gameType: "PUZZLE",
      puzzleIds: todaysGame.puzzleIds,
      score: totalScore,
      totalScore: totalPossibleScore,
    },
  });

  return {
    totalPuzzles: dbPuzzles.length,
    totalCorrect,
    score: totalScore,
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
            id: user.id,
            name: user.name,
            email: user.email,
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

// get all leaderboards
export const getAllLeaderboardService = async (query: any, companyId: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  let startDate = query.startDate ? new Date(query.startDate) : null;
  let endDate = query.endDate ? new Date(query.endDate) : null;

  const andConditions: Prisma.GameResultWhereInput[] = [];

  // Default previous week range
  if (!startDate && !endDate) {
    const now = new Date();
    const currentDay = now.getDay();

    // Last Monday
    let daysToLastMonday = currentDay === 0 ? 6 : currentDay - 1;

    if (daysToLastMonday === 0 && currentDay === 1) {
      daysToLastMonday = 7;
    }

    const lastMonday = new Date(now);
    lastMonday.setDate(now.getDate() - daysToLastMonday);
    lastMonday.setHours(0, 0, 0, 0);

    // Last Sunday
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    lastSunday.setHours(23, 59, 59, 999);

    startDate = lastMonday;
    endDate = lastSunday;
  }

  // Date filter
  if (startDate || endDate) {
    const dateFilter: Prisma.DateTimeFilter = {};

    if (startDate) {
      dateFilter.gte = startDate;
    }

    if (endDate) {
      dateFilter.lte = endDate;
    }

    andConditions.push({
      createdAt: dateFilter,
    });
  }

  // Company filter
  if (companyId) {
    andConditions.push({
      companyId: Number(companyId),
    });
  } else if (query.companyId) {
    andConditions.push({
      companyId: Number(query.companyId),
    });
  }

  // Rig filter
  if (query.rigId) {
    andConditions.push({
      rigId: Number(query.rigId),
    });
  }

  // Game type filter
  if (query.gameType) {
    andConditions.push({
      gameType: query.gameType,
    });
  }

  const whereCondition: Prisma.GameResultWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  // Fetch all game results
  const allResults = await dbClient.gameResult.findMany({
    where: whereCondition,
    select: {
      userId: true,
      score: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      rig: {
        select: {
          id: true,
          name: true,
          location: true,
        },
      },
    },
  });

  if (!allResults.length) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No leaderboards found!");
  }

  // Aggregate score by user
  const userScoresMap = new Map<
    number,
    {
      totalScore: number;
      user: any;
      company: any;
      rig: any;
    }
  >();

  for (const result of allResults) {
    const existingData = userScoresMap.get(result.userId);

    if (existingData) {
      existingData.totalScore += result.score;
    } else {
      userScoresMap.set(result.userId, {
        totalScore: result.score,
        user: result.user,
        company: result.company,
        rig: result.rig,
      });
    }
  }

  // Convert map to array and sort
  let leaderboard = Array.from(userScoresMap.entries())
    .map(([userId, data]) => ({
      userId,
      totalScore: Number(data.totalScore.toFixed(2)),
      user: data.user,
      company: data.company,
      rig: data.rig,
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  // Add rank
  leaderboard = leaderboard.map((item, index) => ({
    rank: index + 1,
    ...item,
  }));

  // Paginated leaderboard
  const paginatedLeaderboard = leaderboard.slice(skip, skip + limit);

  const total = leaderboard.length;

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },

    data: {
      weekRange:
        !query.startDate && !query.endDate
          ? {
              from: startDate,
              to: endDate,
            }
          : null,

      leaderboard: paginatedLeaderboard,
    },
  };
};
