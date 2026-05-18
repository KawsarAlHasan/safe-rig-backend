import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { JwtPayload, Secret } from "jsonwebtoken";
import config from "../../../../config/index";
import ApiError from "../../../../errors/ApiError";
import { emailHelper } from "../../../../helpers/emailHelper";
import { createAuthToken } from "../../../../helpers/jwtHelper";
import { emailTemplate } from "../../../../shared/emailTemplate";
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyEmail,
} from "../../../../types/auth";
import cryptoToken from "../../../../util/cryptoToken";
import generateOTP from "../../../../util/generateOTP";
import { ResetToken } from "../../ResetToken/resetToken.model";
import { dbClient } from "../../../../lib/prisma";

//login
export const loginClientFromDB = async (payload: ILoginData) => {
  const { email, password } = payload;

  // check if client exist
  const isExistClient = await dbClient.client.findUnique({
    where: { email },
  });
  if (!isExistClient) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Login failed. Please check your credentials.",
    );
  }

  // password check
  const isPasswordMatched = await bcrypt.compare(
    password,
    isExistClient.password,
  );

  // password check
  if (!isPasswordMatched) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Login failed. Please check your credentials.",
    );
  }

  //check user status
  if (isExistClient.status !== "ACTIVE") {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `You don’t have permission to access this content. It looks like your account has been ${isExistClient.status}.`,
    );
  }

  //create token
  const createToken = createAuthToken({
    id: isExistClient.id,
    role: "client",
  });

  return { createToken };
};

// create new company and client
export const companyAndClientCreateService = async (payload: any) => {
  const { name, email, phone, clientName, clientEmail, clientPassword, logo } =
    payload;

  // // check if company exist
  // const isExistCompany = await dbClient.company.findUnique({
  //   where: { name },
  // });
  // if (isExistCompany) {
  //   throw new ApiError(StatusCodes.BAD_REQUEST, "Company already exists!");
  // }

  // check if client exist
  const isExistClient = await dbClient.client.findUnique({
    where: { email: clientEmail },
    include: { company: true },
  });

  if (
    isExistClient?.company?.status == "PENDING" &&
    isExistClient?.status == "PENDING"
  ) {
    await dbClient.client.delete({
      where: { id: isExistClient.id },
    });

    await dbClient.company.delete({
      where: { id: isExistClient.companyId },
    });
  } else if (isExistClient) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Client already exists!");
  }

  // create Company
  const result = await dbClient.company.create({
    data: {
      name,
      email,
      phone,
      logo,
      status: "PENDING",
    },
  });

  // check company creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create company!");
  }

  //hash password
  const hashedPassword = await bcrypt.hash(
    clientPassword,
    Number(config.bcrypt_salt_rounds),
  );

  // create client
  await dbClient.client.create({
    data: {
      name: clientName,
      email: clientEmail,
      password: hashedPassword,
      isMainClient: true,
      isVerified: false,
      companyId: result.id,
      status: "PENDING",
    },
  });

  //send email
  const otp = generateOTP();
  const values = {
    otp: otp,
    companyName: name,
    companyEmail: email,
    companyPhone: phone,
    clientName: clientName,
    clientEmail: clientEmail,
  };

  await dbClient.otp.deleteMany({
    where: {
      email: clientEmail,
    },
  });

  // otp saved to DB
  const otpPayload = {
    otp: otp,
    email: clientEmail,
    type: "CLIENT_EMAIL_VERIFICATION",
    expiresAt: new Date(Date.now() + 5 * 60000),
  };

  await dbClient.otp.create({
    data: otpPayload,
  });

  const createCompanyTemplate = emailTemplate.createCompany(values);
  emailHelper(createCompanyTemplate);

  return result;
};

// // verify otp code
// export const verifyClientEmailToDB = async (payload: any) => {
//   const { email, otp } = payload;

//   const isExistClient = await dbClient.client.findUnique({
//     where: { email },
//   });
//   if (!isExistClient) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Client doesn't exist!");
//   }

//   const isExistOtp = await dbClient.otp.findFirst({
//     where: { email, type: "CLIENT_EMAIL_VERIFICATION" },
//   });
//   if (!isExistOtp) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Otp doesn't exist!");
//   }

//   if (isExistOtp.otp !== otp) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "You provided wrong otp");
//   }

//   const date = new Date();
//   if (date > isExistOtp.expiresAt) {
//     await dbClient.otp.deleteMany({
//       where: {
//         email: email,
//       },
//     });

//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       "Otp already expired, Please try again",
//     );
//   }

//   // update company
//   await dbClient.company.update({
//     where: { id: isExistClient.companyId },
//     data: {
//       status: "ACTIVE",
//     },
//   });

//   // update client
//   await dbClient.client.update({
//     where: { email },
//     data: {
//       isVerified: true,
//       status: "ACTIVE",
//     },
//   });

//   // delete otp
//   await dbClient.otp.deleteMany({
//     where: {
//       email: email,
//     },
//   });

//   //create token
//   const createToken = createAuthToken({
//     id: isExistClient.id,
//     role: "client",
//   });

//   return { createToken };
// };

// verify otp code
export const verifyClientEmailToDB = async (payload: any) => {
  const { email, otp } = payload;

  const isExistClient = await dbClient.client.findUnique({
    where: { email },
  });
  if (!isExistClient) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Client doesn't exist!");
  }

  const isExistOtp = await dbClient.otp.findFirst({
    where: { email, type: "CLIENT_EMAIL_VERIFICATION" },
  });
  if (!isExistOtp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Otp doesn't exist!");
  }

  if (isExistOtp.otp !== otp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "You provided wrong otp");
  }

  const date = new Date();
  if (date > isExistOtp.expiresAt) {
    await dbClient.otp.deleteMany({
      where: { email: email },
    });
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Otp already expired, Please try again",
    );
  }

  // start transaction
  const result = await dbClient.$transaction(async (tx) => {
    // 1. company verify and ACTIVE
    const updatedCompany = await tx.company.update({
      where: { id: isExistClient.companyId },
      data: { status: "ACTIVE" },
    });

    // 2. client verify and ACTIVE
    await tx.client.update({
      where: { email },
      data: {
        isVerified: true,
        status: "ACTIVE",
      },
    });

    // 3. delete otp
    await tx.otp.deleteMany({
      where: { email: email },
    });

    // 4. Check if already any Area exists for this company (to avoid duplication)
    const existingAreas = await tx.area.count({
      where: { companyId: updatedCompany.id },
    });

    if (existingAreas === 0) {
      // ---------- Area ----------
      const defaultAreas = await tx.area.findMany({
        where: { isDefault: true, companyId: null },
      });
      for (const area of defaultAreas) {
        await tx.area.create({
          data: {
            name: area.name,
            color: area.color,
            status: area.status,
            companyId: updatedCompany.id,
            isAllRigs: true,
            rigIds: [],
          },
        });
      }

      // ---------- CardType ----------
      const defaultCardTypes = await tx.cardType.findMany({
        where: { isDefault: true, companyId: null },
      });
      for (const cardType of defaultCardTypes) {
        await tx.cardType.create({
          data: {
            name: cardType.name,
            status: cardType.status,
            companyId: updatedCompany.id,
            isAllRigs: true,
            rigIds: [],
          },
        });
      }

      // ---------- Hazard ----------
      const defaultHazards = await tx.hazard.findMany({
        where: { isDefault: true, companyId: null },
      });
      for (const hazard of defaultHazards) {
        await tx.hazard.create({
          data: {
            name: hazard.name,
            status: hazard.status,
            companyId: updatedCompany.id,
            isAllRigs: true,
            rigIds: [],
          },
        });
      }

      // ---------- Alert ----------
      const defaultAlerts = await tx.alert.findMany({
        where: { isDefault: true, companyId: null },
      });
      for (const alert of defaultAlerts) {
        await tx.alert.create({
          data: {
            title: alert.title,
            description: alert.description,
            file: alert.file,
            status: alert.status,
            companyId: updatedCompany.id,
            isAllRigs: true,
            rigIds: [],
          },
        });
      }

      // ---------- Message ----------
      const defaultMessages = await tx.message.findMany({
        where: { isDefault: true, companyId: null },
      });
      for (const message of defaultMessages) {
        await tx.message.create({
          data: {
            title: message.title,
            description: message.description,
            file: message.file,
            sectionTitle: message.sectionTitle,
            status: message.status,
            companyId: updatedCompany.id,
            isAllRigs: true,
            rigIds: [],
          },
        });
      }

      // ---------- RigType ----------
      const defaultRigTypes = await tx.rigType.findMany({
        where: { isDefault: true, companyId: null },
      });
      for (const rigType of defaultRigTypes) {
        await tx.rigType.create({
          data: {
            name: rigType.name,
            status: rigType.status,
            companyId: updatedCompany.id,
            isAllRigs: true,
            rigIds: [],
          },
        });
      }

      // ---------- Videos ----------
      const defaultVideos = await tx.videos.findMany({
        where: { isDefault: true, companyId: null },
      });
      for (const video of defaultVideos) {
        await tx.videos.create({
          data: {
            title: video.title,
            description: video.description,
            position: video.position,
            videoUrl: video.videoUrl,
            thumbnail: video.thumbnail,
            status: video.status,
            companyId: updatedCompany.id,
            isAllRigs: true,
            rigIds: [],
          },
        });
      }
    }

    return updatedCompany;
  });

  // create token
  const createToken = createAuthToken({
    id: isExistClient.id,
    role: "client",
  });

  return { createToken };
};

// resend code
export const resendClientCodeService = async (email: string) => {
  const isExistClient = await dbClient.client.findUnique({
    where: { email },
    include: { company: true },
  });
  if (!isExistClient) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Client doesn't exist!");
  }

  //send email
  const otp = generateOTP();

  const values = {
    otp: otp,
    companyName: isExistClient?.company?.name || "",
    companyEmail: isExistClient?.company?.email || "",
    companyPhone: isExistClient?.company?.phone || "",
    clientName: isExistClient?.name || "",
    clientEmail: isExistClient?.email || "",
  };

  await dbClient.otp.deleteMany({
    where: {
      email: email,
    },
  });

  // otp saved to DB
  const otpPayload = {
    otp: otp,
    email: email,
    type: "CLIENT_EMAIL_VERIFICATION",
    expiresAt: new Date(Date.now() + 5 * 60000),
  };

  await dbClient.otp.create({
    data: otpPayload,
  });

  const createCompanyTemplate = emailTemplate.createCompany(values);
  emailHelper(createCompanyTemplate);

  return isExistClient;
};
