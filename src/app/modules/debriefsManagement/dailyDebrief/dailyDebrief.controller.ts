import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";

import resolveCompanyId from "../../../../helpers/resolveCompanyId";
import { getAllActiveDebriefService } from "./dailyDebrief.service";

// create new Daily debrief
export const createNewDailyDebrief = catchAsync(
  async (req: Request, res: Response) => {
    // const companyId = resolveCompanyId(req);

    // await cardTypeCreateService(req.body, companyId);

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

    // const result = await checkCardSubmissionService(user.id, user.companyId);

    const result = true;

    sendResponse(res, {
      success: result,
      statusCode: StatusCodes.OK,
      message: result
        ? "You can submit a debrief"
        : "You can't submit a debrief",
    });
  },
);
