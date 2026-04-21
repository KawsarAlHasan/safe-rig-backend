import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import resolveCompanyId from "../../../../helpers/resolveCompanyId";
import { puzzleCreateService } from "./puzzle.service";

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

    await puzzleCreateService(payload);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Puzzle created successfully",
    });
  },
);

// // get Puzzle
// export const getAllQuestion = catchAsync(
//   async (req: Request, res: Response) => {
//     const result = await getAllQuestionService(req.query);

//     sendResponse(res, {
//       success: true,
//       statusCode: StatusCodes.OK,
//       message: "Puzzles fetched successfully",
//       pagination: result.meta,
//       data: result.data,
//     });
//   },
// );
