import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import resolveCompanyId from "../../../helpers/resolveCompanyId";
import {
  getSingleHeatmapService,
  heatmapCreateService,
  heatmapGetService,
  updateHeatmapService,
  updateHeatmapStatusService,
} from "./heatmaps.service";

// create heatmap
export const createNewHeatmap = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    let image;
    if (req.files && "image" in req.files && req.files.image[0]) {
      // Build base URL for uploaded file access
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      image = `${baseUrl}/images/${req.files.image[0].filename}`;
    }

    const payload = {
      companyId,
      image,
      ...req.body,
    };

    const result = await heatmapCreateService(payload);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Heatmap created successfully",
      data: result,
    });
  },
);

// get all heatmap with filters and pagination
export const getAllHeatmaps = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    const result = await heatmapGetService(req.query, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Heatmaps fetched successfully",
      pagination: result.meta,
      data: result.data,
    });
  },
);

// get single heatmap
export const getSingleHeatmap = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await getSingleHeatmapService(id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Heatmap fetched successfully",
      data: {
        heatmap: result?.heatmap,
        areas: result?.areas,
      },
    });
  },
);

// area define on heatmap
export const areaDefineHeatmap = catchAsync(
  async (req: Request, res: Response) => {
    const result = await updateHeatmapService(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Area defined on heatmap successfully",
      data: result,
    });
  },
);

// status change
export const heatmapStatusChange = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    await updateHeatmapStatusService(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Heatmap status changed successfully",
    });
  },
);

// // Delete permanent Rig
// export const permanentDeleteRig = catchAsync(
//   async (req: Request, res: Response) => {
//     const companyId = resolveCompanyId(req);
//     const id = req.params.id;

//     await deleteRigService(id, companyId);

//     sendResponse(res, {
//       success: true,
//       statusCode: StatusCodes.OK,
//       message: "Rig  deleted successfully",
//     });
//   },
// );
