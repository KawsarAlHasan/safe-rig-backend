import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";

import resolveCompanyId from "../../../../helpers/resolveCompanyId";
import { getAllActiveDebriefService } from "./dailyDebrief.service";

// create new Daily debrief
export const createNewDailyDebrief = catchAsync(
  async (req: Request, res: Response) => {
    // const companyId = resolveCompanyId(req);

    // await cardTypeCreateService(req.body, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Daily debrief created successfully",
    });
  },
);


// get active debrief
export const getAllActiveDebrief = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).decodedUser;

    const result = await getAllActiveDebriefService(
      user.companyId,
      user.rigId,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Daily debrief fetched successfully",
      data: result,
    });
  },
);


// // get CardType
// export const getCardType = catchAsync(async (req: Request, res: Response) => {
//   const companyId = resolveCompanyId(req);

//   const result = await getCardTypeService(req.query, companyId);

//   sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: "Daily debrief fetched successfully",
//     data: result,
//   });
// });

// // get user all Daily debrief
// export const getAllUserCardType = catchAsync(
//   async (req: Request, res: Response) => {
//     const user = (req as any).decodedUser;

//     const result = await getAllUserCardTypeService(user.companyId, user.rigId);

//     sendResponse(res, {
//       success: true,
//       statusCode: StatusCodes.OK,
//       message: "Daily debrief fetched successfully",
//       data: result,
//     });
//   },
// );

// // update CardType
// export const updateCardType = catchAsync(
//   async (req: Request, res: Response) => {
//     const companyId = resolveCompanyId(req);

//     await updateCardTypeService(req.body, companyId);

//     sendResponse(res, {
//       success: true,
//       statusCode: StatusCodes.OK,
//       message: "Daily debrief updated successfully",
//     });
//   },
// );

// // status change
// export const cardTypeStatusChange = catchAsync(
//   async (req: Request, res: Response) => {
//     const companyId = resolveCompanyId(req);

//     await changeCardTypeStatusService(req.body, companyId);

//     sendResponse(res, {
//       success: true,
//       statusCode: StatusCodes.OK,
//       message: "Daily debrief status changed successfully",
//     });
//   },
// );

// // Delete permanent CardType
// export const permanentDeleteCardType = catchAsync(
//   async (req: Request, res: Response) => {
//     const companyId = resolveCompanyId(req);
//     const id = req.params.id;

//     await deleteCardTypeService(id, companyId);

//     sendResponse(res, {
//       success: true,
//       statusCode: StatusCodes.OK,
//       message: "Daily debrief deleted successfully",
//     });
//   },
// );
