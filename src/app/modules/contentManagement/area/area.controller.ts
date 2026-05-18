import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import { resolveCompanyId } from "../../../../helpers/resolveCompanyId";
import {
  areaCreateService,
  areaCreateServiceByAdmin,
  deleteAreaService,
  getAllUserAreaService,
  getAreaByRigService,
  getAreaService,
  updateAreaService,
} from "./area.service";

// create new Area
export const createNewArea = catchAsync(async (req: Request, res: Response) => {
  const companyId = resolveCompanyId(req);
  await areaCreateService(req.body, companyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Area created successfully",
  });
});

// create new Area by admin
export const createNewAreaByAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    await areaCreateServiceByAdmin(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Area created successfully",
    });
  },
);

// get Area
export const getArea = catchAsync(async (req: Request, res: Response) => {
  const companyId = resolveCompanyId(req);

  const result = await getAreaService(req.query, companyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Areas fetched successfully",
    data: result,
  });
});

// get Area by rig
export const getAreaByRig = catchAsync(async (req: Request, res: Response) => {
  const companyId = resolveCompanyId(req);

  const result = await getAreaByRigService(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Area fetched by rig successfully",
    data: result,
  });
});

// get user all area
export const getAllUserArea = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).decodedUser;

    const result = await getAllUserAreaService(user.companyId, user.rigId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Area fetched successfully",
      data: result,
    });
  },
);

// update Area
export const updateArea = catchAsync(async (req: Request, res: Response) => {
  const companyId = resolveCompanyId(req);

  await updateAreaService(req.body, companyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Area updated successfully",
  });
});

// Delete permanent Area
export const permanentDeleteArea = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);
    const id = req.params.id;

    await deleteAreaService(id, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Area deleted successfully",
    });
  },
);
