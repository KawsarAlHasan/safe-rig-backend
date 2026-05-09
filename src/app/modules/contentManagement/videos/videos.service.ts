import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../../../generated/prisma/client";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";
import { statusName } from "../../../../shared/statusName";
import unlinkFile from "../../../../shared/unlinkFile";

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

  const isAllRigsCheck = isAllRigs == "true" ? true : false;

  // create new Video on prisma dbClient
  const result = await dbClient.videos.create({
    data: {
      title: title,
      description: description,
      position: position,
      videoUrl: videoUrl,
      thumbnail: thumbnail,
      companyId: companyId,
      isDefault: !companyId,
      isAllRigs: true, // isAllRigsCheck,
      rigIds: rigIds,
    },
  });

  // check video creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create Video!");
  }

  return result;
};

// update videos service
export const updateVideoService = async (payloadid: any, payloadData: any) => {
  const id = parseInt(payloadid);

  const {
    title,
    description,
    position,
    videoUrl,
    thumbnail,
    isAllRigs,
    rigIds,
  } = payloadData;

  // check if video exists
  const isExistVideo = await dbClient.videos.findUnique({
    where: { id },
  });

  if (!isExistVideo) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Video not found!");
  }

  // delete old thumbnail if new one is provided
  if (thumbnail && isExistVideo.thumbnail) {
    unlinkFile(isExistVideo.thumbnail);
  }

  // delete old video if new one is provided
  if (videoUrl && isExistVideo.videoUrl) {
    unlinkFile(isExistVideo.videoUrl);
  }

  const isAllRigsCheck =
    isAllRigs !== undefined ? isAllRigs == "true" : isExistVideo.isAllRigs;

  const result = await dbClient.videos.update({
    where: { id },
    data: {
      title: title ?? isExistVideo.title,
      description: description ?? isExistVideo.description,
      position: position ?? isExistVideo.position,
      videoUrl: videoUrl ?? isExistVideo.videoUrl,
      thumbnail: thumbnail ?? isExistVideo.thumbnail,
      isAllRigs: isAllRigsCheck,
      rigIds: rigIds ?? isExistVideo.rigIds,
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update Video!");
  }

  return result;
};

// get Video
export const getAllVideoService = async (query: any, companyId: any) => {
  const andConditions: Prisma.VideosWhereInput[] = [];

  // Search by name
  if (query.search) {
    andConditions.push({
      title: {
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

  const whereCondition: Prisma.VideosWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await dbClient.videos.findMany({
    where: whereCondition, // FIXED (important)
    orderBy: {
      id: "desc",
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch Video!");
  }

  if (result.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No Video found!");
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

// delete video
export const deleteVideoService = async (id: any) => {
  const idNumber = parseInt(id);

  // check video exist
  const isExistVideo = await dbClient.videos.findUnique({
    where: {
      id: idNumber,
    },
  });
  if (!isExistVideo) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Video doesn't exist!");
  }

  // delete image
  if (isExistVideo.thumbnail) {
    unlinkFile(isExistVideo.thumbnail);
  }

  // delete video
  if (isExistVideo.videoUrl) {
    unlinkFile(isExistVideo.videoUrl);
  }

  // delete video
  const result = await dbClient.videos.delete({
    where: {
      id: idNumber,
    },
  });

  return result;
};
