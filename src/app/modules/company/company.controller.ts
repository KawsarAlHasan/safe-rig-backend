import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { companyCreateService } from "./company.service";

// create new Company
export const createNewCompany = catchAsync(
  async (req: Request, res: Response) => {
    // Build base URL for uploaded file access
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    let logo;
    if (req.files && "image" in req.files && req.files.image[0]) {
      logo = `${baseUrl}/images/${req.files.image[0].filename}`;
    }

    const payload = {
      ...req.body,
      logo,
    };

    const result = await companyCreateService(payload);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Company created successfully",
      data: result,
    });
  },
);

// // get all Admin
// export const getAllAdmin = catchAsync(async (req: Request, res: Response) => {
//   const result = await getAllAdminService();

//   sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: "Admin fetched successfully",
//     data: result,
//   });
// });

// // Update an existing Admin
// export const updateAdmin = catchAsync(async (req: Request, res: Response) => {
//   const { ...adminData } = req.body;

//   const result = await updateAdminService(adminData);

//   sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: "Admin updated successfully",
//     data: result,
//   });
// });

// // status change
// export const adminStatusChange = catchAsync(
//   async (req: Request, res: Response) => {
//     const { ...adminData } = req.body;

//     const result = await updateAdminStatusService(adminData);

//     sendResponse(res, {
//       success: true,
//       statusCode: StatusCodes.OK,
//       message: "Admin status changed successfully",
//       data: result,
//     });
//   },
// );

// // Delete an existing Admin
// export const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
//   const adminId = req.params.id;

//   const result = await deleteAdminService(adminId);

//   sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: "Admin deleted successfully",
//     data: result,
//   });
// });
