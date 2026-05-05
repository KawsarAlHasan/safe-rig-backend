import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import resolveCompanyId from "../../../../helpers/resolveCompanyId";
import {
  alertCreateService,
  deleteAlertService,
  getAllAlertService,
  updateAlertService,
} from "./alert.service";

// create new Alert
export const createNewAlert = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    let image;
    if (req.files && "image" in req.files && req.files.image[0]) {
      // Build base URL for uploaded file access
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      image = `${baseUrl}/images/${req.files.image[0].filename}`;
    }

    const payload = {
      ...req.body,
      file: image,
    };

    const result = await alertCreateService(payload, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Alert created successfully",
      data: result,
    });
  },
);

// get AllAlerts
export const getAllAlerts = catchAsync(async (req: Request, res: Response) => {
  const companyId = resolveCompanyId(req);

  const result = await getAllAlertService(req.query, companyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "All Alerts fetched successfully",
    data: result,
  });
});

// update Alert
export const updateAlert = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  let image;
  if (req.files && "image" in req.files && req.files.image[0]) {
    // Build base URL for uploaded file access
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    image = `${baseUrl}/images/${req.files.image[0].filename}`;
  }

  const payloadData = {
    ...req.body,
    file: image,
  };

  const result = await updateAlertService(id, payloadData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Alert updated successfully",
    data: result,
  });
});

// delete Alert
export const deleteAlert = catchAsync(async (req: Request, res: Response) => {
  const result = await deleteAlertService(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Alert deleted successfully",
    data: result,
  });
});
