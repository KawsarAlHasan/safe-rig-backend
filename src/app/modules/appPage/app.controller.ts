import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { getHomeService, setHomePageVideoAndImage } from "./app.service";

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

// get home page for client
export const getHomePageForClient = catchAsync(
  async (req: Request, res: Response) => {
    const client = (req as any).decodedClient;

    const result = await getHomeService(client.rigId, client.companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Home page fetched successfully",
      data: result,
    });
  },
);

// set home page video and image
export const setHomeVideoAndImage = catchAsync(
  async (req: Request, res: Response) => {
    const client = (req as any).decodedClient;

    const payload = {
      ...req.body,
      companyId: client.companyId,
    };

    const result = await setHomePageVideoAndImage(payload);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Home page video and image set successfully",
      data: result,
    });
  },
);
