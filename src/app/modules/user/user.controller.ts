import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import {
  getAllUserService,
  requestAcceptService,
  requestClientAndRigService,
  updateProfileService,
} from "./user.service";
import resolveCompanyId from "../../../helpers/resolveCompanyId";

// request client and rig
export const requestClientAndRig = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req as any).decodedUser.id;

    await requestClientAndRigService(req.body, userId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Request client and rig successfully",
    });
  },
);

// request client and rig
export const requestClientAndRigAccept = catchAsync(
  async (req: Request, res: Response) => {
    // const userId = (req as any).decodedUser.id;

    await requestAcceptService(req.body.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Request Accept successfully",
    });
  },
);

// get user profile
export const userProfile = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).decodedUser;

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User profile fetched successfully",
    data: user,
  });
});

// user profile update
export const userUpdateProfile = catchAsync(
  async (req: Request, res: Response) => {
    let profile;
    if (req.files && "image" in req.files && req.files.image[0]) {
      // Build base URL for uploaded file access
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      profile = `${baseUrl}/images/${req.files.image[0].filename}`;
    }

    const user = (req as any).decodedUser;

    const payload = {
      ...req.body,
      profile: profile ? profile : user.profile,
    };

    await updateProfileService(payload, user);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "User profile updated successfully",
    });
  },
);

// get all users
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const companyId = resolveCompanyId(req);

  const result = await getAllUserService(req.query, companyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User fetched successfully",
    pagination: result.meta,
    data: result.data,
  });
});
