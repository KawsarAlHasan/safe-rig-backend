import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";

import resolveCompanyId from "../../../../helpers/resolveCompanyId";
import {
  changeHazardStatusService,
  deleteHazardService,
  getAllUserHazardService,
  getHazardService,
  hazardCreateService,
  updateHazardService,
} from "./hazard.service";

// create new Hazard
export const createNewHazard = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    await hazardCreateService(req.body, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Hazard created successfully",
    });
  },
);

// get Hazard
export const getHazards = catchAsync(async (req: Request, res: Response) => {
  const companyId = resolveCompanyId(req);

  const result = await getHazardService(req.query, companyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Hazards fetched successfully",
    data: result,
  });
});

// get user all Hazard
export const getAllUserHazard = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).decodedUser;

    const result = await getAllUserHazardService(user.companyId, user.rigId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Hazard fetched successfully",
      data: result,
    });
  },
);

// update Hazard
export const updateHazard = catchAsync(async (req: Request, res: Response) => {
  const companyId = resolveCompanyId(req);

  await updateHazardService(req.body, companyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Hazard updated successfully",
  });
});

// status change
export const hazardStatusChange = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    await changeHazardStatusService(req.body, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Hazard status changed successfully",
    });
  },
);

// Delete permanent Hazard
export const permanentDeleteHazard = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);
    const id = req.params.id;

    await deleteHazardService(id, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Hazard deleted successfully",
    });
  },
);
