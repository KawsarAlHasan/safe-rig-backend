import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import resolveCompanyId from "../../../../helpers/resolveCompanyId";
import { alertCreateService } from "./alert.service";

// create new Alert
export const createNewAlert = catchAsync(
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

    const result = await alertCreateService(payload, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Alert created successfully",
      data: result,
    });
  },
);

// const alerts = await prisma.alert.findMany({
//   where: {
//     companyId: 1,
//     status: "ACTIVE",
//     OR: [
//       {
//         rigIds: {
//           has: 3,
//         },
//       },
//       {
//         isAllRigs: true,
//       },
//     ],
//   },
// });

// // get Alert
// export const getRigTypes = catchAsync(async (req: Request, res: Response) => {
//   const companyId = resolveCompanyId(req);

//   const result = await getRigTypeService(req.query, companyId);

//   sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: "Alerts fetched successfully",
//     data: result,
//   });
// });

// // update Alert
// export const updateRigType = catchAsync(async (req: Request, res: Response) => {
//   const companyId = resolveCompanyId(req);

//   await updateRigTypeService(req.body, companyId);

//   sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: "Alert updated successfully",
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
//       message: "Alert status changed successfully",
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
//       message: "Alert deleted successfully",
//     });
//   },
// );
