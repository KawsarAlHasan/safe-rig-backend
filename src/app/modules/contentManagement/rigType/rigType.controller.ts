import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import {
  deleteRigTypeService,
  getRigTypeService,
  rigTypeCreateService,
  updateRigTypeService,
} from "./rigType.service";
import { resolveCompanyId } from "../../../../helpers/resolveCompanyId";

// create new rig type
export const createNewRigType = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    await rigTypeCreateService(req.body, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Rig type created successfully",
    });
  },
);

// get rig type
export const getRigTypes = catchAsync(async (req: Request, res: Response) => {
  const companyId = resolveCompanyId(req);

  const result = await getRigTypeService(req.query, companyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Rig types fetched successfully",
    data: result,
  });
});

// update rig type
export const updateRigType = catchAsync(async (req: Request, res: Response) => {
  const companyId = resolveCompanyId(req);

  await updateRigTypeService(req.body, companyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Rig type updated successfully",
  });
});

// Delete permanent RigType
export const permanentDeleteRigType = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);
    const id = req.params.id;

    await deleteRigTypeService(id, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Rig type deleted successfully",
    });
  },
);
