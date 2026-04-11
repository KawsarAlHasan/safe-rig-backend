import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../../../generated/prisma/client";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";
import { statusName } from "../../../../shared/statusName";

// create new rig type
export const rigTypeCreateService = async (roleData: any, companyId: any) => {
  const { name, isDefault, isAllRigs, rigIds } = roleData;

  // check rig type name
  const isExistName = await dbClient.rigType.findFirst({
    where: { name: name, companyId: companyId },
  });

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

// get rig type
export const getRigTypeService = async (query: any, companyId: any) => {
  const andConditions: Prisma.RigTypeWhereInput[] = [];

  // Search by name
  if (query.search) {
    andConditions.push({
      name: {
        contains: query.search,
        mode: "insensitive",
      },
    });
  }

  // Status filter
  if (!query.status) {
    andConditions.push({
      status: "ACTIVE",
    });
  } else if (query.status === "all") {
    andConditions.push({
      NOT: {
        status: "DELETED",
      },
    });
  } else {
    andConditions.push({
      status: query.status,
    });
  }

  // Filter by isDefault
  if (query.isDefault !== undefined) {
    andConditions.push({
      isDefault: query.isDefault === "true" || query.isDefault === true,
    });
  }

  if (companyId) {
    andConditions.push({
      companyId: Number(companyId),
    });
  } else if (query.companyId) {
    andConditions.push({
      companyId: Number(query.companyId),
    });
  }

  // Filter by rigIds (array contains)
  if (query.rigId) {
    andConditions.push({
      rigIds: {
        has: Number(query.rigId), // PostgreSQL array filter
      },
    });
  }

  // multiple rigIds support
  if (query.rigIds) {
    const ids = query.rigIds.split(",").map((id: string) => Number(id));

    andConditions.push({
      rigIds: {
        hasSome: ids,
      },
    });
  }

  const whereCondition: Prisma.RigTypeWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await dbClient.rigType.findMany({
    where: whereCondition, // FIXED (important)
    orderBy: {
      id: "desc",
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch rig type!");
  }

  if (result.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No rig types found!");
  }

  return result;
};

// Update an existing Rig Type
export const updateRigTypeService = async (payload: any, companyId: any) => {
  const { id, name, isDefault, isAllRigs, rigIds } = payload;

  // check rig type exist
  const isExistRigType = await dbClient.rigType.findUnique({
    where: { id: id },
  });

  if (!isExistRigType) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Rig Type doesn't exist!");
  }

  // check duplicate name
  if (name && name !== isExistRigType.name) {
    const isDuplicateName = await dbClient.rigType.findFirst({
      where: { companyId: companyId, name: name },
    });

    if (isDuplicateName) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Rig Type with name ${name} already exists!`,
      );
    }
  }

  // update rig type
  const result = await dbClient.rigType.update({
    where: { id: id },
    data: {
      name: name || isExistRigType.name,
      isDefault: isDefault || isExistRigType.isDefault,
      companyId: companyId || isExistRigType.companyId,
      isAllRigs: isAllRigs || isExistRigType.isAllRigs,
      rigIds: rigIds || isExistRigType.rigIds,
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update rig type!");
  }

  return result;
};

// status change
export const changeRigTypeStatusService = async (
  payload: any,
  companyId: any,
) => {
  const { id, status } = payload;

  if (!statusName.includes(status)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Invalid status! You can only change status to ${statusName}`,
    );
  }

  // build where condition
  const whereCondition: any = { id };

  if (companyId) {
    whereCondition.companyId = companyId;
  }

  // check RigType exist
  const isExistRigType = await dbClient.rigType.findUnique({
    where: whereCondition,
  });
  if (!isExistRigType) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Rig Type doesn't exist!");
  }

  // status change
  const result = await dbClient.rigType.update({
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

// permanent rig type delete
export const deleteRigTypeService = async (paramsId: any, companyId: any) => {
  const id = parseInt(paramsId);

  // build where condition
  const whereCondition: any = { id };

  if (companyId) {
    whereCondition.companyId = companyId;
  }

  // check rig type exist
  const isExistRigType = await dbClient.rigType.findUnique({
    where: whereCondition,
  });
  if (!isExistRigType) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Rig Type doesn't exist!");
  }

  // delete rig type
  const result = await dbClient.rigType.delete({
    where: { id: id },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete rig type!");
  }

  return result;
};
