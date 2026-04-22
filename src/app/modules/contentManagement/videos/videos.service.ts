import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../../../generated/prisma/client";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";
import { statusName } from "../../../../shared/statusName";

// create new Video
export const videoCreateService = async (payloadData: any, companyId: any) => {
  const {
    title,
    description,
    position,
    videoUrl,
    thumbnail,
    isAllRigs,
    rigIds,
  } = payloadData;

  // create new Video on prisma dbClient
  const result = await dbClient.videos.create({
    data: {
      title: title,
      description: description,
      position: position,
      videoUrl: videoUrl,
      thumbnail: thumbnail,
      companyId: companyId,
      isAllRigs: true, // isAllRigs,
      rigIds: rigIds,
    },
  });

  // check video creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create Video!");
  }

  return result;
};

// get user all videos
export const getAllUserVideosService = async (companyId: any, rigId: any) => {
  const result = await dbClient.videos.findMany({
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
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch videos!");
  }

  return result;
};

// get single Video
export const getSingleVideoService = async (id: any) => {
  const idNumber = parseInt(id);

  const result = await dbClient.videos.findUnique({
    where: {
      id: idNumber,
    },
  });

  // check video creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch video!");
  }

  return result;
};

// get Video
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
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch Video!");
  }

  if (result.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No Videos found!");
  }

  return result;
};

// Update an existing Video
export const updateRigTypeService = async (payload: any, companyId: any) => {
  const { id, name, isDefault, isAllRigs, rigIds } = payload;

  // check Video exist
  const isExistRigType = await dbClient.rigType.findUnique({
    where: { id: id },
  });

  if (!isExistRigType) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Video doesn't exist!");
  }

  // check duplicate name
  if (name && name !== isExistRigType.name) {
    const isDuplicateName = await dbClient.rigType.findFirst({
      where: { companyId: companyId, name: name },
    });

    if (isDuplicateName) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Video with name ${name} already exists!`,
      );
    }
  }

  // update Video
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
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update Video!");
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
    throw new ApiError(StatusCodes.BAD_REQUEST, "Video doesn't exist!");
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

// permanent Video delete
export const deleteRigTypeService = async (paramsId: any, companyId: any) => {
  const id = parseInt(paramsId);

  // build where condition
  const whereCondition: any = { id };

  if (companyId) {
    whereCondition.companyId = companyId;
  }

  // check Video exist
  const isExistRigType = await dbClient.rigType.findUnique({
    where: whereCondition,
  });
  if (!isExistRigType) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Video doesn't exist!");
  }

  // delete Video
  const result = await dbClient.rigType.delete({
    where: { id: id },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete Video!");
  }

  return result;
};
