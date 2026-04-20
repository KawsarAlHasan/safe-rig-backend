import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import {
  forgotPasswordService,
  setPasswordService,
  signInService,
  verifyOtpService,
} from "./adminAuth.service";

// admin sing in
export const adminLogin = catchAsync(async (req: Request, res: Response) => {
  const result = await signInService(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Admin login successfully",
    data: result.createToken,
  });
});

// forgot password
export const forgotPassword = catchAsync(
  async (req: Request, res: Response) => {
    await forgotPasswordService(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Password reset successfully",
    });
  },
);

// verify otp
export const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  await verifyOtpService(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "OTP verified successfully",
  });
});

// set password
export const setPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await setPasswordService(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Password set successfully",
    data: result.createToken,
  });
});
