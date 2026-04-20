import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import {
  companyCreateService,
  deleteCompanyService,
  getAllCompanyService,
  getCompanyWithRigsService,
  updateCompanyService,
  updateCompanyStatusService,
} from "./company.service";

// create new Company
export const createNewCompany = catchAsync(
  async (req: Request, res: Response) => {
    // // Build base URL for uploaded file access
    // const baseUrl = `${req.protocol}://${req.get("host")}`;

    let logo;
    // if (req.files && "image" in req.files && req.files.image[0]) {
    //   logo = `${baseUrl}/images/${req.files.image[0].filename}`;
    // }

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

// get all Company
export const getAllCompany = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllCompanyService(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Company fetched successfully",
    pagination: result.meta,
    data: result.data,
  });
});

// get all Company
export const getAllCompanyWithRigs = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getCompanyWithRigsService();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Company fetched successfully",
      data: result,
    });
  },
);

// Update an existing Company
export const updateCompany = catchAsync(async (req: Request, res: Response) => {
  const { ...companyData } = req.body;

  const result = await updateCompanyService(companyData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Company updated successfully",
    data: result,
  });
});

// status change
export const companyStatusChange = catchAsync(
  async (req: Request, res: Response) => {
    const { ...companyData } = req.body;

    const result = await updateCompanyStatusService(companyData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Company status changed successfully",
      data: result,
    });
  },
);

// Delete permanent company
export const permanentDeleteCompany = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await deleteCompanyService(id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Company deleted successfully",
      data: result,
    });
  },
);
