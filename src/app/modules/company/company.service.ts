import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiError";
import { dbClient } from "../../../lib/prisma";
import config from "../../../config";
import { statusName } from "../../../shared/statusName";

// create new company
export const companyCreateService = async (payload: any) => {
  const { name, email, phone, clientName, clientEmail, clientPassword, logo } =
    payload;

  // create Company
  const result = await dbClient.company.create({
    data: {
      name,
      email,
      phone,
      logo,
    },
  });

  // check company creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create company!");
  }

  return result;
};

// get all Admin
export const getAllAdminService = async () => {
  const result = await dbClient.admin.findMany({
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });

  // check admin creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch admin!");
  }

  // check if no admin
  if (result.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No admins found!");
  }

  return result;
};

// Update an existing Admin
export const updateAdminService = async (payload: any) => {
  const { id, name, phone, roleId } = payload;

  // check Admin exist
  const isExistAdmin = await dbClient.admin.findUnique({
    where: { id: id },
  });
  if (!isExistAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Admin doesn't exist!");
  }

  // find role by roleId
  const roleData = await dbClient.adminRole.findUnique({
    where: { id: roleId },
  });

  if (!roleData) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Role not found!");
  }

  // update Admin
  const result = await dbClient.admin.update({
    where: { id: id },
    data: {
      name: name,
      phone: phone,
      roleId: roleId,
    },
    include: {
      role: true,
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update admin!");
  }

  return result;
};

// status change
export const updateAdminStatusService = async (payload: any) => {
  const { id, status } = payload;

  if (!statusName.includes(status)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid status!");
  }

  // check Admin exist
  const isExistAdmin = await dbClient.admin.findUnique({
    where: { id: id },
  });
  if (!isExistAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Admin doesn't exist!");
  }

  // status change
  const result = await dbClient.admin.update({
    where: { id: id },
    data: {
      status: status,
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to status change!");
  }

  return result;
};

// Delete an existing Admin
export const deleteAdminService = async (adminId: any) => {
  const id = parseInt(adminId);

  // check Admin exist
  const isExistAdmin = await dbClient.admin.findUnique({
    where: { id: id },
  });
  if (!isExistAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Admin doesn't exist!");
  }

  // delete Admin
  const result = await dbClient.admin.delete({
    where: { id: id },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete admin!");
  }

  return result;
};
