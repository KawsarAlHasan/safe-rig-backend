import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";

import resolveCompanyId from "../../../helpers/resolveCompanyId";
import {
  checkCardSubmissionService,
  getAllUserAreaTypeHazardService,
  submitCardService,
} from "./cardSubmission.service";

// Interface for uploaded file info
interface UploadedFileInfo {
  url: string;
  type: "image" | "video";
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

// create new CardSubmission
export const createNewCardSubmission = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).decodedUser;

    // Get uploaded file info from middleware
    const uploadedFile = (req as any).uploadedFile as
      | UploadedFileInfo
      | undefined;

    let fileUrl = "";
    let fileType = "";

    // Check if file was uploaded
    if (uploadedFile) {
      fileUrl = uploadedFile.url;
      fileType = uploadedFile.type;
    }

    // Prepare payload for database
    const payload = {
      companyId: user.companyId,
      rigId: user.rigId,
      userId: user.id,
      file: fileUrl,
      fileType,
      ...req.body, // Other form data
    };

    const result = await submitCardService(payload);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Card Submission created successfully completed",
      data: result,
    });
  },
);

// get type area hazard
export const getAllUserTypeAreaHazard = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).decodedUser;

    const result = await getAllUserAreaTypeHazardService(
      user.companyId,
      user.rigId,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Area, Card Type, Hazard fetched successfully",
      data: result,
    });
  },
);

// check if card is already submitted
export const checkCardSubmission = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).decodedUser;

    await checkCardSubmissionService(user.id, user.companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "You can submit a new card",
    });
  },
);
