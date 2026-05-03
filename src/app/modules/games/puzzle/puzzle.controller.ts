import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import resolveCompanyId from "../../../../helpers/resolveCompanyId";
import {
  deletePuzzleService,
  getAllPuzzleService,
  puzzleCreateService,
} from "./puzzle.service";

// create new Puzzle
export const createNewPuzzle = catchAsync(
  async (req: Request, res: Response) => {
    let image;
    if (req.files && "image" in req.files && req.files.image[0]) {
      // Build base URL for uploaded file access
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      image = `${baseUrl}/images/${req.files.image[0].filename}`;
    }

    const payload = {
      ...req.body,
      image,
    };

    const result = await puzzleCreateService(payload);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Puzzle created successfully",
      data: result,
    });
  },
);

// get all Puzzle
export const getAllPuzzles = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllPuzzleService(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "all Puzzles fetched successfully",
    pagination: result.meta,
    data: result.data,
  });
});

// Delete permanent Puzzle
export const permanentDeletePuzzle = catchAsync(
  async (req: Request, res: Response) => {
    // const companyId = resolveCompanyId(req);
    const id = req.params.id;

    await deletePuzzleService(id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Puzzle deleted successfully",
    });
  },
);
