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
  const isExistEmail = await dbClient.rigAdmin.findUnique({
    where: { email: email, companyId: companyId },
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
  const result = await dbClient.rigAdmin.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      companyId,
      rigId,
    },
  });

  // check rig admin creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create rig admin!");
  }

  return result;
};

// get all rig Admin
export const getAllRigAdminService = async (companyId: any, query: any) => {
  const { rigId, status } = query;

  // get rig admin
  const result = await dbClient.rigAdmin.findMany({
    where: {
      companyId: Number(companyId),

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
export const updateRigAdminService = async (adminData: any) => {
  const { id, name, email, rigId } = adminData;

  // check Rig Admin exist
  const isExistRigAdmin = await dbClient.rigAdmin.findUnique({
    where: { id: id },
  });
  if (!isExistRigAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Rig Admin doesn't exist!");
  }

  // update Admin
  const result = await dbClient.rigAdmin.update({
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

// Delete an existing rig Admin
export const deleteRigAdminService = async (adminId: any) => {
  const id = parseInt(adminId);

  // check Admin exist
  const isExistAdmin = await dbClient.rigAdmin.findUnique({
    where: { id: id },
  });
  if (!isExistAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Rig Admin doesn't exist!");
  }

  // delete Admin
  const result = await dbClient.rigAdmin.delete({
    where: { id: id },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete rig admin!");
  }

  return result;
};
