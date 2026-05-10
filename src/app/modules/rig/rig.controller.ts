import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import resolveCompanyId from "../../../helpers/resolveCompanyId";
import {
  deleteRigService,
  fleetComparisonService,
  getRigService,
  rigCreateService,
  updateRigService,
} from "./rig.service";

// create new rig
export const createNewRig = catchAsync(async (req: Request, res: Response) => {
  const companyId = resolveCompanyId(req);

  await rigCreateService(req.body, companyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Rig created successfully",
  });
});

// get rig
export const getRigs = catchAsync(async (req: Request, res: Response) => {
  const companyId = resolveCompanyId(req);

  const result = await getRigService(req.query, companyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Rigs fetched successfully",
    data: result,
  });
});

// update rig
export const updateRig = catchAsync(async (req: Request, res: Response) => {
  const companyId = resolveCompanyId(req);

  await updateRigService(req.body, companyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Rig  updated successfully",
  });
});

// Delete permanent Rig
export const permanentDeleteRig = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);
    const id = req.params.id;

    await deleteRigService(id, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Rig  deleted successfully",
    });
  },
);

// fleetComparisonService
export const fleetComparison = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    const payload = {
      ...req.body,
      companyId,
    };

    const result = await fleetComparisonService(payload);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Fleet comparison successfully",
      data: result,
    });
  },
);
