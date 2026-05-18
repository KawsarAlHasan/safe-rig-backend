import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";

import { resolveCompanyId } from "../../../../helpers/resolveCompanyId";
import {
  deleteMessageService,
  getAllMessageService,
  messageCreateService,
  updateMessageService,
} from "./messages.service";

// create new Message
export const createNewMessage = catchAsync(
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

    await messageCreateService(payload, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Message created successfully",
    });
  },
);

// get Message
export const getMessages = catchAsync(async (req: Request, res: Response) => {
  const companyId = resolveCompanyId(req);

  const result = await getAllMessageService(req.query, companyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Messages fetched successfully",
    data: result,
  });
});

// update Message
export const updateMessage = catchAsync(async (req: Request, res: Response) => {
  const companyId = resolveCompanyId(req);

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

  const result = await updateMessageService(id, payloadData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Message updated successfully",
  });
});

// Delete permanent Message
export const permanentDeleteMessage = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);
    const id = req.params.id;

    await deleteMessageService(id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Message deleted successfully",
    });
  },
);
