import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import resolveCompanyId from "../../../../helpers/resolveCompanyId";
import {
  getAllPlansService,
  planCreateService,
  updatePlanService,
} from "./plan.service";

// create initial plan
export const createInitialPlan = catchAsync(
  async (req: Request, res: Response) => {
    if (1 == 1) {
      await planCreateService();
    }

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Plan created successfully",
    });
  },
);

// Get all plan
export const getAllPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllPlansService(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Plan fetched successfully",
    data: result,
  });
});

// updated plan
export const updatePlan = catchAsync(async (req: Request, res: Response) => {
  const result = await updatePlanService(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Plan updated successfully",
    data: result,
  });
});
