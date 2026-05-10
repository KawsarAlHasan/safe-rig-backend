import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";

import resolveCompanyId from "../../../../helpers/resolveCompanyId";
import {
  cardTypeCreateService,
  deleteCardTypeService,
  getAllUserCardTypeService,
  getCardTypeService,
  updateCardTypeService,
} from "./cardType.service";

// create new card Type
export const createNewCardType = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    await cardTypeCreateService(req.body, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Card Type created successfully",
    });
  },
);

// get CardType
export const getCardType = catchAsync(async (req: Request, res: Response) => {
  const companyId = resolveCompanyId(req);

  const result = await getCardTypeService(req.query, companyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Card Type fetched successfully",
    data: result,
  });
});

// get user all Card Type
export const getAllUserCardType = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).decodedUser;

    const result = await getAllUserCardTypeService(user.companyId, user.rigId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Card Type fetched successfully",
      data: result,
    });
  },
);

// update CardType
export const updateCardType = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    await updateCardTypeService(req.body, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Card Type updated successfully",
    });
  },
);

// Delete permanent CardType
export const permanentDeleteCardType = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);
    const id = req.params.id;

    await deleteCardTypeService(id, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Card Type deleted successfully",
    });
  },
);
