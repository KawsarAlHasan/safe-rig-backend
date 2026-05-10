import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../../../generated/prisma/client";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";
import { statusName } from "../../../../shared/statusName";

// create new Hazard
export const hazardCreateService = async (roleData: any, companyId: any) => {
  const { name, isDefault, isAllRigs, rigIds } = roleData;

  // check Hazard name
  const isExistInAllHazard = await dbClient.hazard.findFirst({
    where: {
      name: name,
      companyId: companyId,
      isAllRigs: true,
    },
  });

  if (isExistInAllHazard) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Hazard already exists!");
  }

  if (isAllRigs) {
    const isExistAny = await dbClient.hazard.findFirst({
      where: {
        name: name,
        companyId: companyId,
      },
    });

    if (isExistAny) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Hazard already exists!");
    }
  }

  if (!isAllRigs && rigIds?.length > 0) {
    const isExistInHazard = await dbClient.hazard.findFirst({
      where: {
        name: name,
        companyId: companyId,
        rigIds: {
          hasSome: rigIds,
        },
      },
    });

    if (isExistInHazard) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Hazard already exists for one or more selected rigs!",
      );
    }
  }

  // create new Hazard on prisma dbClient
  const result = await dbClient.hazard.create({
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
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create Hazard!");
  }

  return result;
};

// get Hazard
export const getHazardService = async (query: any, companyId: any) => {
  const andConditions: Prisma.HazardWhereInput[] = [];

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

  const whereCondition: Prisma.HazardWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await dbClient.hazard.findMany({
    where: whereCondition, // FIXED (important)
    orderBy: {
      id: "desc",
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch Hazard!");
  }

  if (result.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No Hazards found!");
  }

  const allRigIds = result.flatMap((ct) => ct.rigIds);
  const uniqueRigIds = [...new Set(allRigIds)];

  let rigsMap = new Map();

  if (uniqueRigIds.length > 0) {
    const rigs = await dbClient.rig.findMany({
      where: {
        id: { in: uniqueRigIds },
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
      },
    });

    rigsMap = new Map(rigs.map((rig) => [rig.id, rig]));
  }

  const resultData = result.map((mainData) => ({
    ...mainData,
    rigDetails: mainData.rigIds
      .map((rigId) => rigsMap.get(rigId))
      .filter((rig) => rig !== undefined),
  }));

  return resultData;
};

// get user all Hazard
export const getAllUserHazardService = async (companyId: any, rigId: any) => {
  const result = await dbClient.hazard.findMany({
    where: {
      companyId: companyId,
      status: "ACTIVE",
      OR: [
        {
          rigIds: {
            has: rigId,
          },
        },
        {
          isAllRigs: true,
        },
      ],
    },
    orderBy: {
      id: "desc",
    },
  });

  // check video creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch Hazard!");
  }

  return result;
};

// Update an existing Hazard
export const updateHazardService = async (payload: any, companyId: any) => {
  const { id, name, isDefault, isAllRigs, rigIds } = payload;

  // check Hazard exist
  const isExistHazard = await dbClient.hazard.findUnique({
    where: { id: id },
  });

  if (!isExistHazard) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Hazard doesn't exist!");
  }

  // check duplicate name
  if (name && name !== isExistHazard.name) {
    const isDuplicateName = await dbClient.hazard.findFirst({
      where: { companyId: companyId, name: name },
    });

    if (isDuplicateName) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Hazard with name ${name} already exists!`,
      );
    }
  }

  // update Hazard
  const result = await dbClient.hazard.update({
    where: { id: id },
    data: {
      name: name || isExistHazard.name,
      isDefault: isDefault || isExistHazard.isDefault,
      companyId: companyId || isExistHazard.companyId,
      isAllRigs: isAllRigs || isExistHazard.isAllRigs,
      rigIds: rigIds || isExistHazard.rigIds,
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update Hazard!");
  }

  return result;
};

// permanent Hazard delete
export const deleteHazardService = async (paramsId: any, companyId: any) => {
  const id = parseInt(paramsId);

  // build where condition
  const whereCondition: any = { id };

  if (companyId) {
    whereCondition.companyId = companyId;
  }

  // check Hazard exist
  const isExistHazard = await dbClient.hazard.findUnique({
    where: whereCondition,
  });
  if (!isExistHazard) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Hazard doesn't exist!");
  }

  // delete Hazard
  const result = await dbClient.hazard.delete({
    where: { id: id },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete Hazard!");
  }

  return result;
};
