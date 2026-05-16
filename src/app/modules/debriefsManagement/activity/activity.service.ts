import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../../../generated/prisma/client";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";
import { statusName } from "../../../../shared/statusName";

// create new Activity
export const activityCreateService = async (roleData: any, companyId: any) => {
  const { name, isDefault, isAllRigs, rigIds } = roleData;

  // check Activity name
  const isExistInAllActivity = await dbClient.activity.findFirst({
    where: {
      name: name,
      companyId: companyId,
      isAllRigs: true,
    },
  });

  if (isExistInAllActivity) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Activity already exists!");
  }

  if (isAllRigs) {
    const isExistAny = await dbClient.activity.findFirst({
      where: {
        name: name,
        companyId: companyId,
      },
    });

    if (isExistAny) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Activity already exists!`);
    }
  }

  if (!isAllRigs && rigIds?.length > 0) {
    const isExistInActivity = await dbClient.activity.findFirst({
      where: {
        name: name,
        companyId: companyId,
        rigIds: {
          hasSome: rigIds,
        },
      },
    });

    if (isExistInActivity) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Activity already exists!");
    }
  }

  // create new Activity on prisma dbClient
  const result = await dbClient.activity.create({
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
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create Activity!");
  }

  return result;
};

// get Activity
export const getActivityService = async (query: any, companyId: any) => {
  const andConditions: Prisma.ActivityWhereInput[] = [];

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
        has: Number(query.rigId),
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

  const whereCondition: Prisma.ActivityWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const dbData = await dbClient.activity.findMany({
    where: whereCondition,
    orderBy: {
      id: "desc",
    },
  });

  if (!dbData) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch Card Types!");
  }

  if (dbData.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No Card Types found!");
  }

  const allRigIds = dbData.flatMap((ct) => ct.rigIds);
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

  const result = dbData.map((cardType) => ({
    ...cardType,
    rigDetails: cardType.rigIds
      .map((rigId) => rigsMap.get(rigId))
      .filter((rig) => rig !== undefined),
  }));

  return result;
};

// get user all Activity
export const getAllUserActivityService = async (companyId: any, rigId: any) => {
  const result = await dbClient.activity.findMany({
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
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch Activity!");
  }

  return result;
};

// Update an existing activity
export const updateActivityService = async (payload: any, companyId: any) => {
  const { id, name, isDefault, isAllRigs, rigIds } = payload;

  // check activity exist
  const isExistActivity = await dbClient.activity.findUnique({
    where: { id: id },
  });

  if (!isExistActivity) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Activity doesn't exist!");
  }

  // check duplicate name
  if (name && name !== isExistActivity.name) {
    const isDuplicateName = await dbClient.activity.findFirst({
      where: { companyId: companyId, name: name },
    });

    if (isDuplicateName) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Activity with name ${name} already exists!`,
      );
    }
  }

  // update Activity
  const result = await dbClient.activity.update({
    where: { id: id },
    data: {
      name: name || isExistActivity.name,
      isDefault: isDefault || isExistActivity.isDefault,
      companyId: companyId || isExistActivity.companyId,
      isAllRigs: isAllRigs,
      rigIds: rigIds || isExistActivity.rigIds,
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update Activity!");
  }

  return result;
};

// status change
export const changeActivityStatusService = async (
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

  // check activity exist
  const isExistActivity = await dbClient.activity.findUnique({
    where: whereCondition,
  });
  if (!isExistActivity) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Activity doesn't exist!");
  }

  // status change
  const result = await dbClient.activity.update({
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

// permanent activity delete
export const deleteActivityService = async (paramsId: any, companyId: any) => {
  const id = parseInt(paramsId);

  // build where condition
  const whereCondition: any = { id };

  if (companyId) {
    whereCondition.companyId = companyId;
  }

  // check activity exist
  const isExistActivity = await dbClient.activity.findUnique({
    where: whereCondition,
  });
  if (!isExistActivity) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Activity doesn't exist!");
  }

  // delete activity
  const result = await dbClient.activity.delete({
    where: { id: id },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete Activity!");
  }

  return result;
};
