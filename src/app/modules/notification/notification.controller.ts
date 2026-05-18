import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { resolveCompanyId } from "../../../helpers/resolveCompanyId";
import {
  changeIsReadService,
  getMyNotificationService,
} from "./notification.service";

// get user notification
export const getUserNotification = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).decodedUser;

    const result = await getMyNotificationService(user.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Notification fetched successfully",
      data: result,
    });
  },
);

// chage to read
export const changeToRead = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).decodedUser;

  const result = await changeIsReadService(req.params.id, user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Notification updated successfully",
    data: result,
  });
});
