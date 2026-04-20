import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";

import resolveCompanyId from "../../../helpers/resolveCompanyId";
import { getAllUserAreaTypeHazardService } from "./cardSubmission.service";

// create new CardSubmission
export const createNewCardSubmission = catchAsync(
  async (req: Request, res: Response) => {
    // const companyId = resolveCompanyId(req);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Card Submission created successfully completed",
    });
  },
);

// get type area hazard
export const getAllUserTypeAreaHazard = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).decodedUser;

    const result = await getAllUserAreaTypeHazardService(
      user.companyId,
      user.rigId,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Area, Card Type, Hazard fetched successfully",
      data: result,
    });
  },
);
