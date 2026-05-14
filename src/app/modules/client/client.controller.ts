import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";

import resolveCompanyId from "../../../helpers/resolveCompanyId";
import { deleteRigAdminService, getAllRigAdminService, rigAdminCreateService, updateRigAdminService } from "./client.service";

// create new rig Admin
export const createNewRigAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    const payload = { ...req.body, companyId };

    const result = await rigAdminCreateService(payload);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Rig Admin created successfully",
      data: result,
    });
  },
);

// get all rig Admin
export const getAllRigAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);
    const result = await getAllRigAdminService(companyId, req.query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Rig Admin fetched successfully",
      data: result,
    });
  },
);

// get admin profile
export const adminProfile = catchAsync(async (req: Request, res: Response) => {
  const admin = (req as any).decodedAdmin;

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Admin profile fetched successfully",
    data: admin,
  });
});

// Update an existing Rig Admin
export const updateRigAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const { ...adminData } = req.body;

    const result = await updateRigAdminService(adminData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Rig Admin updated successfully",
      data: result,
    });
  },
);

// Delete an existing Rig Admin
export const deleteRigAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.params.id;

    const result = await deleteRigAdminService(adminId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Rig Admin deleted successfully",
      data: result,
    });
  },
);
