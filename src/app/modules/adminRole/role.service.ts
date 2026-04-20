import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { dbClient } from "../../../lib/prisma";

// create new role
export const roleCreateService = async (roleData: any) => {
  const { name, permissions } = roleData;

  // check role name
  const isExistName = await dbClient.adminRole.findUnique({
    where: { name: name },
  });

  // check role name
  if (isExistName) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Role already exists!");
  }

  // create new role on prisma dbClient
  const result = await dbClient.adminRole.create({
    data: {
      name: name,
      permissions: {
        create: permissions,
      },
    },
  });

  // check role creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create role!");
  }

  return result;
};

// get all role
export const getAllRoleService = async () => {
  const result = await dbClient.adminRole.findMany({
    include: {
      permissions: true,
    },
  });

  // check role creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch role!");
  }

  return result;
};

// Update an existing role
export const updateRoleService = async (roleData: any) => {
  const { id, name, permissions } = roleData;

  // check role exist
  const isExistRole = await dbClient.adminRole.findUnique({
    where: { id: id },
  });
  if (!isExistRole) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Role doesn't exist!");
  }

  // update role
  const result = await dbClient.adminRole.update({
    where: { id: id },
    data: {
      name: name,
      permissions: {
        deleteMany: {},
        create: permissions,
      },
    },
  });

  return result;
};

// Delete an existing role
export const deleteRoleService = async (roleId: any) => {
  const id = parseInt(roleId);

  // check role exist
  const isExistRole = await dbClient.adminRole.findUnique({
    where: { id: id },
  });
  if (!isExistRole) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Role doesn't exist!");
  }

  // delete role
  const result = await dbClient.adminRole.delete({
    where: { id: id },
  });

  return result;
};
