import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import {
  companyAndClientCreateService,
  loginClientFromDB,
  resendClientCodeService,
  verifyClientEmailToDB,
} from "./clientAuth.service";

// login client
export const loginClient = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await loginClientFromDB(loginData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Client login successfully",
    data: result.createToken,
  });
});

// get profile
export const clientProfile = catchAsync(async (req: Request, res: Response) => {
  const client = (req as any).decodedClient;
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Client profile",
    data: client,
  });
});

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



    const result = await companyAndClientCreateService(payload);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Company created successfully",
      data: result,
    });
  },
);

// verify email
export const verifyClientEmailOtp = catchAsync(
  async (req: Request, res: Response) => {
    const result = await verifyClientEmailToDB(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Email verified successfully",
      data: result.createToken,
    });
  },
);

// resend client code
export const resendClientCode = catchAsync(
  async (req: Request, res: Response) => {
    const result = await resendClientCodeService(req.body.email);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Resend code successfully",
    });
  },
);

// // user sing in
// export const userLogin = catchAsync(async (req: Request, res: Response) => {
//   const result = await signInService(req.body);

//   sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: "User login successfully",
//     data: {
//       token: result.createToken,
//       user: result.isExistUser,
//     },
//   });
// });

// // forgot password
// export const forgotPassword = catchAsync(
//   async (req: Request, res: Response) => {
//     await forgotPasswordService(req.body);

//     sendResponse(res, {
//       success: true,
//       statusCode: StatusCodes.OK,
//       message: "Password reset successfully",
//     });
//   },
// );

// // verify otp
// export const verifyOtp = catchAsync(async (req: Request, res: Response) => {
//   await verifyOtpService(req.body);

//   sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: "OTP verified successfully",
//   });
// });

// // set password
// export const setPassword = catchAsync(async (req: Request, res: Response) => {
//   const result = await setPasswordService(req.body);

//   sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: "Password set successfully",
//     data: result.createToken,
//   });
// });

// // Delete permanent User
// export const permanentDeleteUser = catchAsync(
//   async (req: Request, res: Response) => {
//     const id = req.params.id;

//     const result = await deleteUserService(id);

//     sendResponse(res, {
//       success: true,
//       statusCode: StatusCodes.OK,
//       message: "User deleted successfully",
//       data: result,
//     });
//   },
// );
