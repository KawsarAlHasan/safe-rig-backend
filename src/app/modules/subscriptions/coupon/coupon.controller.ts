import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import {
  couponCreateService,
  deleteCouponService,
  getAllCouponService,
} from "./coupon.service";

// create new coupon
export const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await couponCreateService(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Coupon created successfully",
    data: result,
  });
});

// get all coupons
export const getAllCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllCouponService();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Coupon fetched successfully",
    data: result,
  });
});

// delete coupon
export const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await deleteCouponService(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Coupon deleted successfully",
    data: result,
  });
});
