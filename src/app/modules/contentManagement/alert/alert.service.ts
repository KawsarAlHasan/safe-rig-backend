import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../../../generated/prisma/client";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";
import { statusName } from "../../../../shared/statusName";
import unlinkFile from "../../../../shared/unlinkFile";

// create new alert
export const alertCreateService = async (roleData: any, companyId: any) => {
  const { title, description, file, isAllRigs, rigIds } = roleData;

  const isAllRigsCheck = isAllRigs == "true" ? true : false;

  // create new alert on prisma dbClient
  const result = await dbClient.alert.create({
    data: {
      title: title,
      description: description,
      file: file,
      companyId: companyId,
      isDefault: !companyId,
      isAllRigs: true, //isAllRigsCheck,
      rigIds: [], //rigIds,
    },
  });

  // check role creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create alert!");
  }

  return result;
};

// update alert service
export const updateAlertService = async (payloadid: any, payloadData: any) => {
  const id = parseInt(payloadid);

  const { title, description, file, isAllRigs, rigIds } = payloadData;

  // check if Alert exists
  const isExistAlert = await dbClient.alert.findUnique({
    where: { id },
  });

  if (!isExistAlert) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Alert not found!");
  }

  // delete old file if new one is provided
  if (file && isExistAlert.file) {
    unlinkFile(isExistAlert.file);
  }

  const isAllRigsCheck =
    isAllRigs !== undefined ? isAllRigs == "true" : isExistAlert.isAllRigs;

  const result = await dbClient.alert.update({
    where: { id },
    data: {
      title: title ?? isExistAlert.title,
      description: description ?? isExistAlert.description,
      file: file ?? isExistAlert.file,
      isAllRigs: isAllRigsCheck,
      rigIds: rigIds ?? isExistAlert.rigIds,
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update alert!");
  }

  return result;
};

// get Alert
export const getAllAlertService = async (query: any, companyId: any) => {
  const andConditions: Prisma.AlertWhereInput[] = [];

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

  const whereCondition: Prisma.AlertWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await dbClient.alert.findMany({
    where: whereCondition, // FIXED (important)
    orderBy: {
      id: "desc",
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch alert!");
  }

  if (result.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No alert found!");
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

// delete alert
export const deleteAlertService = async (id: any) => {
  const idNumber = parseInt(id);

  // check Alert exist
  const isExistAlert = await dbClient.alert.findUnique({
    where: {
      id: idNumber,
    },
  });
  if (!isExistAlert) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Alert doesn't exist!");
  }

  // delete image
  if (isExistAlert.file) {
    unlinkFile(isExistAlert.file);
  }

  // delete Alert
  const result = await dbClient.alert.delete({
    where: {
      id: idNumber,
    },
  });

  return result;
};
