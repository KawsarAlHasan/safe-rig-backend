import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../../../generated/prisma/client";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";
import { statusName } from "../../../../shared/statusName";

// create new Card type
export const cardTypeCreateService = async (roleData: any, companyId: any) => {
  const { name, isDefault, isAllRigs, rigIds } = roleData;

  if (isDefault) {
    // check rig type name
    const isExistInAllRigs = await dbClient.cardType.findFirst({
      where: {
        name: name,
        isDefault: true,
      },
    });

    if (isExistInAllRigs) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Rig type already exists!");
    }
  } else {
    // check card type name
    const isExistInAllCardType = await dbClient.cardType.findFirst({
      where: {
        name: name,
        companyId: companyId,
        isAllRigs: true,
        isDefault: false,
      },
    });

    if (isExistInAllCardType) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Card type already exists!");
    }

    if (isAllRigs) {
      const isExistAny = await dbClient.cardType.findFirst({
        where: {
          name: name,
          companyId: companyId,
          isAllRigs: false,
          isDefault: false,
        },
      });

      if (isExistAny) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Card type already exists!`,
        );
      }
    }

    if (!isAllRigs && rigIds?.length > 0) {
      const isExistInCardType = await dbClient.cardType.findFirst({
        where: {
          name: name,
          companyId: companyId,
          rigIds: {
            hasSome: rigIds,
          },
        },
      });

      if (isExistInCardType) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Card type already exists!",
        );
      }
    }
  }

  // create new Card type on prisma dbClient
  const result = await dbClient.cardType.create({
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
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create Card type!");
  }

  return result;
};

// get Card type
export const getCardTypeService = async (query: any, companyId: any) => {
  const andConditions: Prisma.CardTypeWhereInput[] = [];

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

  const whereCondition: Prisma.CardTypeWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const cardTypes = await dbClient.cardType.findMany({
    where: whereCondition,
    orderBy: {
      id: "desc",
    },
  });

  if (!cardTypes) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch Card Types!");
  }

  if (cardTypes.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No Card Types found!");
  }

  const allRigIds = cardTypes.flatMap((ct) => ct.rigIds);
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

  const result = cardTypes.map((cardType) => ({
    ...cardType,
    rigDetails: cardType.rigIds
      .map((rigId) => rigsMap.get(rigId))
      .filter((rig) => rig !== undefined),
  }));

  return result;
};

// get user all card type
export const getAllUserCardTypeService = async (companyId: any, rigId: any) => {
  const result = await dbClient.cardType.findMany({
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
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch Card Type!");
  }

  return result;
};

// Update an existing CardType
export const updateCardTypeService = async (payload: any, companyId: any) => {
  const { id, name, isDefault, isAllRigs, rigIds } = payload;

  // check CardType exist
  const isExistCardType = await dbClient.cardType.findUnique({
    where: { id: id },
  });

  if (!isExistCardType) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Card Type doesn't exist!");
  }

  // check duplicate name
  if (name && name !== isExistCardType.name) {
    const isDuplicateName = await dbClient.cardType.findFirst({
      where: { companyId: companyId, name: name },
    });

    if (isDuplicateName) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Card Type with name ${name} already exists!`,
      );
    }
  }

  // update Card Type
  const result = await dbClient.cardType.update({
    where: { id: id },
    data: {
      name: name || isExistCardType.name,
      isDefault: isDefault || isExistCardType.isDefault,
      companyId: companyId || isExistCardType.companyId,
      isAllRigs: isAllRigs || isExistCardType.isAllRigs,
      rigIds: rigIds || isExistCardType.rigIds,
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update Card Type!");
  }

  return result;
};

// status change
export const changeCardTypeStatusService = async (
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

  // check CardType exist
  const isExistCardType = await dbClient.cardType.findUnique({
    where: whereCondition,
  });
  if (!isExistCardType) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Card Type doesn't exist!");
  }

  // status change
  const result = await dbClient.cardType.update({
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

// permanent CardType delete
export const deleteCardTypeService = async (paramsId: any, companyId: any) => {
  const id = parseInt(paramsId);

  // build where condition
  const whereCondition: any = { id };

  if (companyId) {
    whereCondition.companyId = companyId;
  }

  // check CardType exist
  const isExistCardType = await dbClient.cardType.findUnique({
    where: whereCondition,
  });
  if (!isExistCardType) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Card Type doesn't exist!");
  }

  // delete CardType
  const result = await dbClient.cardType.delete({
    where: { id: id },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete Card Type!");
  }

  return result;
};
