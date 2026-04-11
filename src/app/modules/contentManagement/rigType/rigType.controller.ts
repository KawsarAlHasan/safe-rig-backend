import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import {
  changeRigTypeStatusService,
  deleteRigTypeService,
  getRigTypeService,
  rigTypeCreateService,
  updateRigTypeService,
} from "./rigType.service";

// create new rig type
export const createNewRigType = catchAsync(
  async (req: Request, res: Response) => {
    const { ...bodyData } = req.body;

    await rigTypeCreateService(bodyData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Rig type created successfully",
    });
  },
);

// get rig type
export const getRigTypes = catchAsync(async (req: Request, res: Response) => {
  const result = await getRigTypeService(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Rig types fetched successfully",
    data: result,
  });
});

// update rig type
export const updateRigType = catchAsync(async (req: Request, res: Response) => {
  const { ...bodyData } = req.body;

  await updateRigTypeService(bodyData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Rig type updated successfully",
  });
});

// status change
export const rigTypeStatusChange = catchAsync(
  async (req: Request, res: Response) => {
    const { ...bodyData } = req.body;

    await changeRigTypeStatusService(bodyData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Rig type status changed successfully",
    });
  },
);

// Delete permanent RigType
export const permanentDeleteRigType = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;

    await deleteRigTypeService(id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Rig type deleted successfully",
    });
  },
);
