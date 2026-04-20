import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { getHomeService } from "./app.service";

// get home page
export const getHomePage = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).decodedUser;

  const result = await getHomeService(user.rigId, user.companyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Home page fetched successfully",
    data: result,
  });
});
