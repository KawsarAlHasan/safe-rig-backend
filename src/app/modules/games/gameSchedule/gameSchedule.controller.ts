import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import {
  getGameScheduleService,
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

// get game schedule
export const getGameSchedule = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getGameScheduleService();

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
    const result = await questionSubmitService(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Game schedule fetched successfully",
      data: result,
    });
  },
);
