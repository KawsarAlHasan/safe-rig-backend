import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import {
  adminCreateService,
  deleteAdminService,
  getAllAdminService,
  updateAdminService,
  updateAdminStatusService,
} from "./admin.service";

// create new Admin
export const createNewAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const { ...adminData } = req.body;

    const result = await adminCreateService(adminData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Admin created successfully",
      data: result,
    });
  },
);

// get all Admin
export const getAllAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllAdminService();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Admin fetched successfully",
    data: result,
  });
});

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

// Update an existing Admin
export const updateAdmin = catchAsync(async (req: Request, res: Response) => {
  const { ...adminData } = req.body;

  const result = await updateAdminService(adminData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Admin updated successfully",
    data: result,
  });
});

// status change
export const adminStatusChange = catchAsync(
  async (req: Request, res: Response) => {
    const { ...adminData } = req.body;

    const result = await updateAdminStatusService(adminData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Admin status changed successfully",
      data: result,
    });
  },
);

// Delete an existing Admin
export const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.params.id;

  const result = await deleteAdminService(adminId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Admin deleted successfully",
    data: result,
  });
});











