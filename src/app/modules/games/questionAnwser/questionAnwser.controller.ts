import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import resolveCompanyId from "../../../../helpers/resolveCompanyId";
import {
  getAllQuestionService,
  questionCreateService,
} from "./questionAnwser.service";

// create new Question and Anwsar
export const createNewQuestion = catchAsync(
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

    await questionCreateService(payload);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Question and Anwsar created successfully",
    });
  },
);

// get Question and Anwsar
export const getAllQuestion = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getAllQuestionService(req.query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Question and Anwsars fetched successfully",
      pagination: result.meta,
      data: result.data,
    });
  },
);

// // update Question and Anwsar
// export const updateRigType = catchAsync(async (req: Request, res: Response) => {
//   const companyId = resolveCompanyId(req);

//   await updateRigTypeService(req.body, companyId);

//   sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: "Question and Anwsar updated successfully",
//   });
// });

// // status change
// export const rigTypeStatusChange = catchAsync(
//   async (req: Request, res: Response) => {
//     const companyId = resolveCompanyId(req);

//     await changeRigTypeStatusService(req.body, companyId);

//     sendResponse(res, {
//       success: true,
//       statusCode: StatusCodes.OK,
//       message: "Question and Anwsar status changed successfully",
//     });
//   },
// );

// // Delete permanent RigType
// export const permanentDeleteRigType = catchAsync(
//   async (req: Request, res: Response) => {
//     const companyId = resolveCompanyId(req);
//     const id = req.params.id;

//     await deleteRigTypeService(id, companyId);

//     sendResponse(res, {
//       success: true,
//       statusCode: StatusCodes.OK,
//       message: "Question and Anwsar deleted successfully",
//     });
//   },
// );
