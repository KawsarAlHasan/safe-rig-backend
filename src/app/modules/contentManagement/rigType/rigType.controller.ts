import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import {
  deleteRoleService,
  getAllRoleService,
  roleCreateService,
  updateRoleService,
} from "./role.service";

// create new role
export const createNewRole = catchAsync(async (req: Request, res: Response) => {
  const { ...roleData } = req.body;

  const result = await roleCreateService(roleData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Role created successfully",
    data: result,
  });
});

// get all role
export const getAllRole = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllRoleService();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Role fetched successfully",
    data: result,
  });
});

// Update an existing role
export const updateRole = catchAsync(async (req: Request, res: Response) => {
  const { ...roleData } = req.body;

  const result = await updateRoleService(roleData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Role updated successfully",
    data: result,
  });
});

// Delete an existing role
export const deleteRole = catchAsync(async (req: Request, res: Response) => {
  const roleId = req.params.id;

  const result = await deleteRoleService(roleId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Role deleted successfully",
    data: result,
  });
});
