import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../../../generated/prisma/client";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";
import { statusName } from "../../../../shared/statusName";

// create new Area
export const areaCreateService = async (payloadData: any, companyId: any) => {
  const { name, isDefault, isAllRigs, rigIds } = payloadData;

  // check Area name
  const isExistInAllArea = await dbClient.area.findFirst({
    where: {
      name: name,
      companyId: companyId,
      isAllRigs: true,
    },
  });

  if (isExistInAllArea) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Area already exists!");
  }

  if (isAllRigs) {
    const isExistAny = await dbClient.area.findFirst({
      where: {
        name: name,
        companyId: companyId,
      },
    });

    if (isExistAny) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Area already exists!`);
    }
  }

  if (!isAllRigs && rigIds?.length > 0) {
    const isExistInArea = await dbClient.area.findFirst({
      where: {
        name: name,
        companyId: companyId,
        rigIds: {
          hasSome: rigIds,
        },
      },
    });

    if (isExistInArea) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Area already exists for one or more selected rigs!",
      );
    }
  }

  const primaryColorCodes = [
    "#FF0000",
    "#0000FF",
    "#008000",
    "#000000",
    "#FFFF00",
    "#FFA500",
    "#800080",
    "#FF00FF",
    "#00FFFF",
    "#FFC0CB",
    "#FF7F50",
    "#808000",
    "#FFFFFF",
  ];

  const secondaryColorCodes = [
    "#A52A2A",
    "#808080",
    "#4B0082",
    "#008080",
    "#000080",
    "#FFF44F",
    "#40E0D0",
    "#2E8B57",
    "#DC143C",
    "#1E90FF",
    "#FF1493",
    "#7FFF00",
    "#B22222",
    "#5F9EA0",
    "#DAA520",
    "#ADFF2F",
    "#FF4500",
    "#6A5ACD",
    "#20B2AA",
    "#FF6347",
    "#4682B4",
    "#D2691E",
    "#9ACD32",
    "#C71585",
    "#00FA9A",
    "#B0C4DE",
    "#F4A460",
  ];

  let usedColors: string[] = [];

  if (isAllRigs) {
    const allAreas = await dbClient.area.findMany({
      where: { companyId },
      select: { color: true },
    });
    usedColors = allAreas.map((a) => a.color).filter(Boolean) as string[];
  } else if (rigIds?.length > 0) {
    const overlappingAreas = await dbClient.area.findMany({
      where: {
        companyId,
        OR: [{ rigIds: { hasSome: rigIds } }, { isAllRigs: true }],
      },
      select: { color: true },
    });
    usedColors = overlappingAreas
      .map((a) => a.color)
      .filter(Boolean) as string[];
  }

  let selectedColor: string | undefined = primaryColorCodes.find(
    (c) => !usedColors.includes(c),
  );

  if (!selectedColor) {
    selectedColor = secondaryColorCodes.find((c) => !usedColors.includes(c));
  }

  if (!selectedColor) {
    selectedColor = primaryColorCodes[0];
  }

  // create new Hazard on prisma dbClient
  const result = await dbClient.area.create({
    data: {
      name: name,
      color: selectedColor,
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

// get Area
export const getAreaService = async (query: any, companyId: any) => {
  const andConditions: Prisma.AreaWhereInput[] = [];

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

  const whereCondition: Prisma.AreaWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await dbClient.area.findMany({
    where: whereCondition, // FIXED (important)
    orderBy: {
      id: "desc",
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch Area!");
  }

  if (result.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No Areas found!");
  }

  return result;
};


// get user all area
export const getAllUserAreaService = async (companyId: any, rigId: any) => {
  const result = await dbClient.area.findMany({
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
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch Area!");
  }

  return result;
};

// Update an existing Area
export const updateRigTypeService = async (payload: any, companyId: any) => {
  const { id, name, isDefault, isAllRigs, rigIds } = payload;

  // check Area exist
  const isExistRigType = await dbClient.area.findUnique({
    where: { id: id },
  });

  if (!isExistRigType) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Area doesn't exist!");
  }

  // check duplicate name
  if (name && name !== isExistRigType.name) {
    const isDuplicateName = await dbClient.area.findFirst({
      where: { companyId: companyId, name: name },
    });

    if (isDuplicateName) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Area with name ${name} already exists!`,
      );
    }
  }

  // update Area
  const result = await dbClient.area.update({
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
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update Area!");
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
  const isExistRigType = await dbClient.area.findUnique({
    where: whereCondition,
  });
  if (!isExistRigType) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Area doesn't exist!");
  }

  // status change
  const result = await dbClient.area.update({
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

// permanent Area delete
export const deleteRigTypeService = async (paramsId: any, companyId: any) => {
  const id = parseInt(paramsId);

  // build where condition
  const whereCondition: any = { id };

  if (companyId) {
    whereCondition.companyId = companyId;
  }

  // check Area exist
  const isExistRigType = await dbClient.area.findUnique({
    where: whereCondition,
  });
  if (!isExistRigType) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Area doesn't exist!");
  }

  // delete Area
  const result = await dbClient.area.delete({
    where: { id: id },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete Area!");
  }

  return result;
};
