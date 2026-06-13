import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiError";
import { dbClient } from "../../../lib/prisma";
import config from "../../../config";
import { statusName } from "../../../shared/statusName";

// create new rig Admin
export const rigAdminCreateService = async (adminData: any) => {
  const { name, email, password, phone, companyId, rigId } = adminData;

  // check if email already exists
  const isExistEmail = await dbClient.client.findUnique({
    where: { email: email },
  });

  // check if email already exists
  if (isExistEmail) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Email already exists!");
  }

  //hash password
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  // create rigAdmin
  const result = await dbClient.client.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      isMainClient: false,
      companyId,
      rigId,
    },
  });

  // check rig admin creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create rig admin!");
  }

  console.log(result, "result");

  return result;
};

// get all rig Admin
export const getAllRigAdminService = async (companyId: any, query: any) => {
  const { rigId, status } = query;

  // get rig admin
  const result = await dbClient.client.findMany({
    where: {
      companyId: Number(companyId),
      isMainClient: false,

      ...(rigId && {
        rigId: Number(rigId),
      }),

      ...(status && {
        status,
      }),
    },

    include: {
      rig: true,
    },

    orderBy: {
      id: "desc",
    },
  });

  // check admin creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch rig admin!");
  }

  // check if no rig admin
  if (result.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No rig admin found!");
  }

  return result;
};

// Update an existing Rig Admin
export const updateRigAdminService = async (payload: any) => {
  const { id, name, email, rigId } = payload;

  // check Rig Admin exist
  const isExistRigAdmin = await dbClient.client.findUnique({
    where: { id: id },
  });
  if (!isExistRigAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Rig Admin doesn't exist!");
  }

  // update Admin
  const result = await dbClient.client.update({
    where: { id: id },
    data: {
      name: name,
      email: email,
      rigId: rigId,
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update rig admin!");
  }

  return result;
};

// Update an existing Rig Admin
export const updateClientProfileService = async (payload: any) => {
  const {
    id,
    isMainClient,
    companyId,
    profilePic,
    logo,
    name,
    phone,
    companyName,
    companyPhone,
    companyEmail,
  } = payload;

  if (isMainClient) {
    // check company exist
    const isExistCompany = await dbClient.company.findUnique({
      where: { id: companyId },
    });
    if (!isExistCompany) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Company doesn't exist!");
    }

    // update company
    const result = await dbClient.company.update({
      where: { id: companyId },
      data: {
        name: companyName || isExistCompany.name,
        phone: companyPhone || isExistCompany.phone,
        email: companyEmail || isExistCompany.email,
        logo: logo || isExistCompany.logo,
      },
    });

    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update company!");
    }
  }

  // update Admin
  const result = await dbClient.client.update({
    where: { id: id },
    data: {
      profilePic: profilePic,
      name: name,
      phone: phone,
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update rig admin!");
  }

  return result;
};

// Delete an existing rig Admin
export const deleteRigAdminService = async (adminId: any) => {
  const id = parseInt(adminId);

  // check Admin exist
  const isExistAdmin = await dbClient.client.findUnique({
    where: { id: id, isMainClient: false },
  });
  if (!isExistAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Rig Admin doesn't exist!");
  }

  // delete Admin
  const result = await dbClient.client.delete({
    where: { id: id },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete rig admin!");
  }

  return result;
};

// updated password
export const updatePasswordService = async (payload: any) => {
  const { id, currentPassword, password } = payload;

  // check rig admin exist
  const isExistRigAdmin = await dbClient.client.findUnique({
    where: { id: id },
  });
  if (!isExistRigAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Rig Admin doesn't exist!");
  }

  // check rig admin password
  const isPasswordMatched = await bcrypt.compare(
    currentPassword,
    isExistRigAdmin.password,
  );

  // check rig admin password
  if (!isPasswordMatched) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Current password is incorrect!",
    );
  }

  //hash password
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  // update rig admin password
  const result = await dbClient.client.update({
    where: { id: id },
    data: {
      password: hashedPassword,
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update rig admin!");
  }

  return result;
};
