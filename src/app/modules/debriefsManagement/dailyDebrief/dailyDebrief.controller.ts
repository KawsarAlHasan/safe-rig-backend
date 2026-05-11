import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";

import resolveCompanyId from "../../../../helpers/resolveCompanyId";
import {
  checkDebriefService,
  createDebriefService,
  getAllActiveDebriefService,
} from "./dailyDebrief.service";
import { dbClient } from "../../../../lib/prisma";

// create new Daily debrief
export const createNewDailyDebrief = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).decodedUser;

    const payload = {
      companyId: user.companyId,
      rigId: user.rigId,
      userId: user.id,
      ...req.body,
    };

    await createDebriefService(payload);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Daily debrief created successfully",
    });
  },
);

// get active debrief
export const getAllActiveDebrief = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).decodedUser;

    const result = await getAllActiveDebriefService(user.companyId, user.rigId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Daily debrief fetched successfully",
      data: result,
    });
  },
);

// check if Debrief is already submitted
export const checkDebriefSubmission = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).decodedUser;

    const getRig = await dbClient.rig.findFirst({
      where: {
        id: user.rigId,
      },
    });

    const result = await checkDebriefService(user.id, user.companyId);

    sendResponse(res, {
      success: result,
      statusCode: StatusCodes.OK,
      message: result
        ? "You can submit a debrief"
        : "You can't submit a debrief",
      data: getRig,
    });
  },
);
