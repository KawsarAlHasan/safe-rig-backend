import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../../../generated/prisma/client";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";
import unlinkFile from "../../../../shared/unlinkFile";

// create new message
export const messageCreateService = async (roleData: any, companyId: any) => {
  const { title, description, file, sectionTitle, isAllRigs, rigIds } =
    roleData;

  // create new message on prisma dbClient
  const result = await dbClient.message.create({
    data: {
      title: title,
      description: description,
      file: file,
      sectionTitle: sectionTitle,
      companyId: companyId,
      isDefault: !companyId,
      isAllRigs: isAllRigs,
      rigIds: rigIds,
    },
  });

  // check message creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create message!");
  }

  return result;
};

// update Message service
export const updateMessageService = async (
  payloadid: any,
  payloadData: any,
) => {
  const id = parseInt(payloadid);

  const { sectionTitle, title, description, file, isAllRigs, rigIds } =
    payloadData;

  // check if Message exists
  const isExistMessage = await dbClient.message.findUnique({
    where: { id },
  });

  if (!isExistMessage) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Message not found!");
  }

  // delete old file if new one is provided
  if (file && isExistMessage.file) {
    unlinkFile(isExistMessage.file);
  }

  const isAllRigsCheck =
    isAllRigs !== undefined ? isAllRigs == "true" : isExistMessage.isAllRigs;

  const result = await dbClient.message.update({
    where: { id },
    data: {
      sectionTitle: sectionTitle ?? isExistMessage.sectionTitle,
      title: title ?? isExistMessage.title,
      description: description ?? isExistMessage.description,
      file: file ?? isExistMessage.file,
      isAllRigs: isAllRigsCheck,
      rigIds: rigIds ?? isExistMessage.rigIds,
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update message!");
  }

  return result;
};

// get Message
export const getAllMessageService = async (query: any, companyId: any) => {
  const andConditions: Prisma.MessageWhereInput[] = [];

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

  const whereCondition: Prisma.MessageWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await dbClient.message.findMany({
    where: whereCondition, // FIXED (important)
    orderBy: {
      id: "desc",
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch Message!");
  }

  if (result.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No Message found!");
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

// delete Message
export const deleteMessageService = async (id: any) => {
  const idNumber = parseInt(id);

  // check Message exist
  const isExistMessage = await dbClient.message.findUnique({
    where: {
      id: idNumber,
    },
  });
  if (!isExistMessage) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Message doesn't exist!");
  }

  // delete image
  if (isExistMessage.file) {
    unlinkFile(isExistMessage.file);
  }

  // delete Message
  const result = await dbClient.message.delete({
    where: {
      id: idNumber,
    },
  });

  return result;
};
