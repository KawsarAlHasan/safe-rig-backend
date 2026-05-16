import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";

import {
  resolveCompanyId,
  resolveRigId,
} from "../../../../helpers/resolveCompanyId";
import {
  checkDebriefService,
  createDebriefService,
  getAllActiveDebriefService,
  getDebriefCardSubmissionService,
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

    // const result = await checkDebriefService(user.id, user.companyId);

    sendResponse(res, {
      success: true, // result,
      statusCode: StatusCodes.OK,
      message: true ? "You can submit a debrief" : "You can't submit a debrief",
      data: getRig,
    });
  },
);

// get all CardSubmission
export const getAllDebriefCardSubmission = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);
    const rigIdResolve = resolveRigId(req);

    const result = await getDebriefCardSubmissionService(
      req.query,
      companyId,
      rigIdResolve,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Debrief Card Submission fetched successfully",
      pagination: result.meta,
      data: result.data,
    });
  },
);
