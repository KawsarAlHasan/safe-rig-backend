import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiError";
import { dbClient } from "../../../lib/prisma";
import config from "../../../config";
import { statusName } from "../../../shared/statusName";

// create new Admin
export const adminCreateService = async (adminData: any) => {
  const { name, email, password, phone, roleId } = adminData;

  // check if email already exists
  const isExistEmail = await dbClient.admin.findUnique({
    where: { email },
  });

  // check if email already exists
  if (isExistEmail) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Email already exists!");
  }

  // find role by roleId
  const roleData = await dbClient.adminRole.findUnique({
    where: { id: roleId },
  });

  if (!roleData) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Role not found!");
  }

  //hash password
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  // create admin
  const result = await dbClient.admin.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      roleId: roleData.id,
    },
    include: {
      role: true,
    },
  });

  // check admin creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create admin!");
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
export const updateAdminService = async (adminData: any) => {
  const { id, name, phone, roleId } = adminData;

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
export const updateAdminStatusService = async (adminData: any) => {
  const { id, status } = adminData;

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
