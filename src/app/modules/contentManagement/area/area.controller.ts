import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import resolveCompanyId from "../../../../helpers/resolveCompanyId";
import {
  areaCreateService,
  getAllUserAreaService,
  getAreaService,
} from "./area.service";

// create new Area
export const createNewArea = catchAsync(async (req: Request, res: Response) => {
  const companyId = resolveCompanyId(req);

  await areaCreateService(req.body, companyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Area created successfully",
  });
});

// get Area
export const getArea = catchAsync(async (req: Request, res: Response) => {
  const companyId = resolveCompanyId(req);

  const result = await getAreaService(req.query, companyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Areas fetched successfully",
    data: result,
  });
});

// get user all area
export const getAllUserArea = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).decodedUser;

    const result = await getAllUserAreaService(user.companyId, user.rigId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Area fetched successfully",
      data: result,
    });
  },
);

// // update Area
// export const updateRigType = catchAsync(async (req: Request, res: Response) => {
//   const companyId = resolveCompanyId(req);

//   await updateRigTypeService(req.body, companyId);

//   sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: "Area updated successfully",
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
//       message: "Area status changed successfully",
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
//       message: "Area deleted successfully",
//     });
//   },
// );
