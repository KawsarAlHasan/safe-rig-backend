import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../../generated/prisma/client";
import ApiError from "../../../errors/ApiError";
import { dbClient } from "../../../lib/prisma";
import { statusName } from "../../../shared/statusName";

// create new rig
export const rigCreateService = async (payload: any, companyId: any) => {
  const { name, location, latitude, longitude, rigTypeId } = payload;

  // check rig  name
  const isExistName = await dbClient.rig.findFirst({
    where: { name: name, companyId: companyId },
  });

  // check role name
  if (isExistName) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Rig already exists!");
  }

  // create new rig  on prisma dbClient
  const result = await dbClient.rig.create({
    data: {
      name: name,
      location: location,
      latitude: latitude,
      longitude: longitude,
      companyId: companyId,
      rigTypeId: rigTypeId,
    },
  });

  // check role creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create rig!");
  }

  return result;
};

// get rig
export const getRigService = async (query: any, companyId: any) => {
  const andConditions: Prisma.RigWhereInput[] = [];

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

  if (companyId) {
    andConditions.push({
      companyId: Number(companyId),
    });
  } else if (query.companyId) {
    andConditions.push({
      companyId: Number(query.companyId),
    });
  }

  const whereCondition: Prisma.RigWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await dbClient.rig.findMany({
    where: whereCondition,
    orderBy: {
      id: "desc",
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch rig!");
  }

  if (result.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No rig found!");
  }

  return result;
};


// Update an existing Rig
export const updateRigService = async (payload: any, companyId: any) => {
  const { id, name, location, latitude, longitude, rigTypeId } = payload;

  // check rig  exist
  const isExistRig = await dbClient.rig.findUnique({
    where: { id: id },
  });

  if (!isExistRig) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Rig doesn't exist!");
  }

  // check duplicate name
  if (name && name !== isExistRig.name) {
    const isDuplicateName = await dbClient.rig.findFirst({
      where: { companyId: companyId, name: name },
    });

    if (isDuplicateName) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Rig with name ${name} already exists!`,
      );
    }
  }

  // update rig
  const result = await dbClient.rig.update({
    where: { id: id },
    data: {
      name: name || isExistRig.name,
      companyId: companyId || isExistRig.companyId,
      location: location || isExistRig.location,
      latitude: latitude || isExistRig.latitude,
      longitude: longitude || isExistRig.longitude,
      rigTypeId: rigTypeId || isExistRig.rigTypeId,
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update rig!");
  }

  return result;
};

// status change
export const changeRigStatusService = async (payload: any, companyId: any) => {
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

  // check Rig exist
  const isExistRig = await dbClient.rig.findUnique({
    where: whereCondition,
  });
  if (!isExistRig) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Rig doesn't exist!");
  }

  // status change
  const result = await dbClient.rig.update({
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

// permanent rig delete
export const deleteRigService = async (paramsId: any, companyId: any) => {
  const id = parseInt(paramsId);

  // build where condition
  const whereCondition: any = { id };

  if (companyId) {
    whereCondition.companyId = companyId;
  }

  // check rig  exist
  const isExistRig = await dbClient.rig.findUnique({
    where: whereCondition,
  });
  if (!isExistRig) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Rig doesn't exist!");
  }

  // delete rig
  const result = await dbClient.rig.delete({
    where: { id: id },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete rig!");
  }

  return result;
};
