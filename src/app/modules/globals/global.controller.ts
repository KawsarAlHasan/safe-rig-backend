import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import resolveCompanyId from "../../../helpers/resolveCompanyId";
import {
  getAdminDashboardOverviewService,
  getRigAreaTypeHazardService,
  globalStatusService,
} from "./global.service";

// status update global
export const globalStatus = catchAsync(async (req: Request, res: Response) => {
  await globalStatusService(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Status updated successfully",
  });
});

// get rig, area, type, hazard
export const getRigAreaTypeHazard = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    const result = await getRigAreaTypeHazardService(companyId, req.query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Rig, Area, Card Type, Hazard fetched successfully",
      data: result,
    });
  },
);

// get rig, area, type, hazard
export const getAdminDashboardOverview = catchAsync(
  async (req: Request, res: Response) => {

    const result = await getAdminDashboardOverviewService();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Get admin dashboard overview successfully",
      data: result,
    });
  },
);
