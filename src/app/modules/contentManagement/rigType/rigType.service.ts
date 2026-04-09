import { StatusCodes } from "http-status-codes";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";

// create new rig type
export const rigTypeCreateService = async (roleData: any) => {
  const { name, isDefault, companyId, isAllRigs, rigIds } = roleData;

  // check rig type name
  const isExistName = await dbClient.rigType.findFirst({
    where: { name: name, companyId: companyId },
  });

  // // check role name
  // const isExistName = await dbClient.rigType.findFirst({
  //   where: { name: name, NOT: { id: roleData.id } },
  // });

  // check role name
  if (isExistName) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Rig type already exists!");
  }

  // create new rig type on prisma dbClient
  const result = await dbClient.rigType.create({
    data: {
      name: name,
      isDefault: isDefault,
      companyId: companyId,
      isAllRigs: isAllRigs,
      rigIds: rigIds,
    },
  });

  // check role creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create rig type!");
  }

  return result;
};

// // get all role
// export const getAllRoleService = async () => {
//   const result = await dbClient.rigType.findMany({
//     include: {
//       permissions: true,
//     },
//   });

//   // check role creation
//   if (!result) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch role!");
//   }

//   return result;
// };

// // Update an existing role
// export const updateRoleService = async (roleData: any) => {
//   const { id, name, permissions } = roleData;

//   // check role exist
//   const isExistRole = await dbClient.rigType.findUnique({
//     where: { id: id },
//   });
//   if (!isExistRole) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Role doesn't exist!");
//   }

//   // update role
//   const result = await dbClient.rigType.update({
//     where: { id: id },
//     data: {
//       name: name,
//       permissions: {
//         deleteMany: {},
//         create: permissions,
//       },
//     },
//   });

//   return result;
// };

// // Delete an existing role
// export const deleteRoleService = async (roleId: any) => {
//   const id = parseInt(roleId);

//   // check role exist
//   const isExistRole = await dbClient.rigType.findUnique({
//     where: { id: id },
//   });
//   if (!isExistRole) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Role doesn't exist!");
//   }

//   // delete role
//   const result = await dbClient.rigType.delete({
//     where: { id: id },
//   });

//   return result;
// };
