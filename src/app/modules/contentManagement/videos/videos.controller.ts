import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import { resolveCompanyId } from "../../../../helpers/resolveCompanyId";
import {
  deleteVideoService,
  getAllUserVideosService,
  getAllVideoService,
  getSingleVideoService,
  updateVideoService,
  videoCreateService,
} from "./videos.service";

// create new Video
export const createNewVideo = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    let videoUrl;
    let thumbnail;

    // Build base URL for uploaded file access
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    if (req.files && files?.video?.[0]) {
      videoUrl = `${baseUrl}/videos/${files.video[0].filename}`;
    }

    if (req.files && files?.thumbnail?.[0]) {
      thumbnail = `${baseUrl}/images/${files.thumbnail[0].filename}`;
    }

    const payloadData = {
      ...req.body, // body from title, description, position, rigIds field
      videoUrl,
      thumbnail,
    };

    const result = await videoCreateService(payloadData, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Video created successfully",
      data: result,
    });
  },
);

// update video
export const updateVideo = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  let videoUrl;
  let thumbnail;

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  if (req.files && files?.video?.[0]) {
    videoUrl = `${baseUrl}/videos/${files.video[0].filename}`;
  }

  if (req.files && files?.thumbnail?.[0]) {
    thumbnail = `${baseUrl}/images/${files.thumbnail[0].filename}`;
  }

  const payloadData = {
    ...req.body,
    ...(videoUrl && { videoUrl }),
    ...(thumbnail && { thumbnail }),
  };

  const result = await updateVideoService(id, payloadData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Video updated successfully",
    data: result,
  });
});

// get user all videos
export const getAllUserVideos = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).decodedUser;

    const result = await getAllUserVideosService(user.companyId, user.rigId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Videos fetched successfully",
      data: result,
    });
  },
);

// get Single videos
export const getSingleVideos = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getSingleVideoService(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Videos fetched successfully",
      data: result,
    });
  },
);

// get AllVideos
export const getAllVideos = catchAsync(async (req: Request, res: Response) => {
  const companyId = resolveCompanyId(req);

  const result = await getAllVideoService(req.query, companyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "AllVideoss fetched successfully",
    data: result,
  });
});

// delete video
export const deleteVideo = catchAsync(async (req: Request, res: Response) => {
  const result = await deleteVideoService(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Video deleted successfully",
    data: result,
  });
});
