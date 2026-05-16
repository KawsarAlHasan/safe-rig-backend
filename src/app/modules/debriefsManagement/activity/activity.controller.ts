import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";

import { resolveCompanyId } from "../../../../helpers/resolveCompanyId";
import {
  activityCreateService,
  changeActivityStatusService,
  deleteActivityService,
  getAllUserActivityService,
  getActivityService,
  updateActivityService,
} from "./activity.service";

// create new Activity
export const createNewActivity = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    await activityCreateService(req.body, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Activity created successfully",
    });
  },
);

// get Activity
export const getActivity = catchAsync(async (req: Request, res: Response) => {
  const companyId = resolveCompanyId(req);

  const result = await getActivityService(req.query, companyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Activity fetched successfully",
    data: result,
  });
});

// get user all Activity
export const getAllUserActivity = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).decodedUser;

    const result = await getAllUserActivityService(user.companyId, user.rigId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Activity fetched successfully",
      data: result,
    });
  },
);

// update Activity
export const updateActivity = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    await updateActivityService(req.body, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Activity updated successfully",
    });
  },
);

// status change
export const activityStatusChange = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    await changeActivityStatusService(req.body, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Activity status changed successfully",
    });
  },
);

// Delete permanent Activity
export const permanentDeleteActivity = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);
    const id = req.params.id;

    await deleteActivityService(id, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Activity deleted successfully",
    });
  },
);
