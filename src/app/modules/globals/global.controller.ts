import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import resolveCompanyId from "../../../helpers/resolveCompanyId";
import { globalStatusService } from "./global.service";

// status update global
export const globalStatus = catchAsync(async (req: Request, res: Response) => {
  await globalStatusService(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Status updated successfully",
  });
});
