import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";
import config from "../../../../config";
import generateOTP from "../../../../util/generateOTP";
import { emailTemplate } from "../../../../shared/emailTemplate";
import { emailHelper } from "../../../../helpers/emailHelper";
import { createAuthToken } from "../../../../helpers/jwtHelper";

// sign up
export const signupService = async (payload: any) => {
  const { name, email, entryCompany, position, phone, password } = payload;

  if (!email || !password) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Email and password are required!",
    );
  }

  // check if email already exists
  const isExistEmail = await dbClient.user.findUnique({
    where: { email },
  });

  // check if email already exists
  if (isExistEmail && isExistEmail.isVerified === true) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Email already exists!");
  }

  // check if email already exists
  if (isExistEmail && isExistEmail.isVerified === false) {
    await dbClient.user.deleteMany({
      where: {
        email: email,
      },
    });
  }

  //hash password
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  if (!hashedPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "hashedPassword is required");
  }

  // create user
  const result = await dbClient.user.create({
    data: {
      name,
      email,
      entryCompany,
      position,
      phone,
      password: hashedPassword,
    },
  });

  // check user creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to sign up!");
  }

  //send email
  const otp = generateOTP();
  const values = {
    name: name,
    otp: otp,
    email: email!,
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
    type: "USER_EMAIL_VERIFICATION",
    expiresAt: new Date(Date.now() + 5 * 60000),
  };

  await dbClient.otp.create({
    data: otpPayload,
  });

  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper(createAccountTemplate);

  return result;
};

// verify otp code
export const verifyEmailToDB = async (payload: any) => {
  const { email, otp } = payload;

  const isExistUser = await dbClient.user.findUnique({
    where: { email },
  });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const isExistOtp = await dbClient.otp.findFirst({
    where: { email, type: "USER_EMAIL_VERIFICATION" },
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
      where: {
        email: email,
      },
    });

    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Otp already expired, Please try again",
    );
  }

  // update user
  await dbClient.user.update({
    where: { email },
    data: {
      isVerified: true,
      status: "ACTIVE",
    },
  });

  // delete otp
  await dbClient.otp.deleteMany({
    where: {
      email: email,
    },
  });

  //create token
  const createToken = createAuthToken({
    id: isExistUser.id,
    role: "user",
  });

  return { createToken, isExistUser };
};

// resend code
export const resendCodeService = async (email: string) => {
  const isExistUser = await dbClient.user.findUnique({
    where: { email },
  });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //send email
  const otp = generateOTP();
  const values = {
    name: isExistUser?.name || "",
    otp: otp,
    email: email!,
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
    type: "USER_EMAIL_VERIFICATION",
    expiresAt: new Date(Date.now() + 5 * 60000),
  };

  await dbClient.otp.create({
    data: otpPayload,
  });

  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper(createAccountTemplate);

  return isExistUser;
};

// sign in
export const signInService = async (payload: any) => {
  const { email, password } = payload;

  const isExistUser = await dbClient.user.findUnique({
    where: { email },
  });
  if (!isExistUser) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Login failed. Please check your credentials.",
    );
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    isExistUser.password,
  );

  if (!isPasswordMatched) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Login failed. Please check your credentials.",
    );
  }

  if (!isExistUser.isVerified) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User is not verified! Please verify your email.");
  }

  if (isExistUser.status !== "ACTIVE") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User is not active!");
  }

  //create token
  const createToken = createAuthToken({
    id: isExistUser.id,
    role: "user",
  });

  return { createToken, isExistUser };
};

// forgot password
export const forgotPasswordService = async (payload: any) => {
  const { email } = payload;

  const isExistUser = await dbClient.user.findUnique({
    where: { email },
  });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //send email
  const otp = generateOTP();
  const values = {
    name: isExistUser?.name || "",
    otp: otp,
    email: email!,
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
    type: "USER_RESET_PASSWORD",
    expiresAt: new Date(Date.now() + 5 * 60000),
  };

  await dbClient.otp.create({
    data: otpPayload,
  });

  const resetPasswordTemplate = emailTemplate.resetPassword(values);
  emailHelper(resetPasswordTemplate);

  return isExistUser;
};

// verify otp
export const verifyOtpService = async (payload: any) => {
  const { email, otp } = payload;

  const isExistOtp = await dbClient.otp.findFirst({
    where: { email, type: "USER_RESET_PASSWORD" },
  });
  if (!isExistOtp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Otp doesn't exist!");
  }

  if (isExistOtp.otp !== otp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid Otp!");
  }

  const date = new Date();
  if (date > isExistOtp.expiresAt) {
    await dbClient.otp.deleteMany({
      where: {
        email: email,
      },
    });

    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Otp already expired, Please try again",
    );
  }

  return isExistOtp;
};

// set password
export const setPasswordService = async (payload: any) => {
  const { email, otp, password } = payload;

  const isExistOtp = await dbClient.otp.findFirst({
    where: { email, type: "USER_RESET_PASSWORD" },
  });
  if (!isExistOtp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Otp doesn't exist!");
  }

  if (isExistOtp.otp !== otp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid Otp!");
  }

  const date = new Date();
  if (date > isExistOtp.expiresAt) {
    await dbClient.otp.deleteMany({
      where: {
        email: email,
      },
    });

    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Otp already expired, Please try again",
    );
  }

  const isExistUser = await dbClient.user.findUnique({
    where: { email },
  });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const hashPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  await dbClient.user.update({
    where: { id: isExistUser.id },
    data: {
      password: hashPassword,
    },
  });

  // delete otp
  await dbClient.otp.deleteMany({
    where: {
      email: email,
    },
  });

  //create token
  const createToken = createAuthToken({
    id: isExistUser.id,
    role: "user",
  });

  return { createToken };
};

// Delete User Account
export const deleteUserService = async (payloadId: any) => {
  const id = parseInt(payloadId);

  // check User exist
  const isExistUser = await dbClient.user.findUnique({
    where: { id: id },
  });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // delete User
  const result = await dbClient.user.delete({
    where: { id: id },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete User!");
  }

  return result;
};
