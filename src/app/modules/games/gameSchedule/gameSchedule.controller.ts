import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import {
  getGameScheduleForAdminService,
  getGameScheduleService,
  leaderboardService,
  puzzleSubmitService,
  questionSubmitService,
  saveGameScheduleService,
} from "./gameSchedule.service";

// save game schedule
export const saveGameSchedule = catchAsync(
  async (req: Request, res: Response) => {
    const result = await saveGameScheduleService(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Game schedule saved successfully",
      data: result,
    });
  },
);

// get game schedule for admin
export const getGameScheduleForAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getGameScheduleForAdminService(req.params.date);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Game schedule fetched successfully",
      data: result,
    });
  },
);

// get game schedule
export const getGameSchedule = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).decodedUser;
    const result = await getGameScheduleService(user);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Game schedule fetched successfully",
      data: result,
    });
  },
);

// question submit
export const questionSubmit = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).decodedUser;

    const payload = {
      ...req.body,
      user,
    };

    const result = await questionSubmitService(payload);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Question Submitted successfully",
      data: result,
    });
  },
);

// Puzzle submit
export const puzzleSubmit = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).decodedUser;

  const payload = {
    ...req.body,
    user,
  };

  const result = await puzzleSubmitService(payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Puzzle Submitted successfully",
    data: result,
  });
});

// get leaderboard
export const getLeaderboard = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).decodedUser;

    const result = await leaderboardService(user);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Leaderboard fetched successfully",
      data: result,
    });
  },
);
