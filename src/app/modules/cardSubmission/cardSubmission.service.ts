import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { dbClient } from "../../../lib/prisma";
import { IQuery } from "../../../types/company";
import { Prisma } from "../../../../generated/prisma/client";

// submit card
export const submitCardService = async (payload: any) => {
  const {
    companyId,
    rigId,
    userId,
    cardTypeId,
    areaId,
    hazardId,
    description,
    riskSeverity,
    file,
    fileType,
    actionTaken,
    immediateAction,
    submitAnonymously,
    submitDay,
  } = payload;

  const today = new Date();
  const dateOnly = today.toISOString().split("T")[0];

  const finalDate = submitDay ? submitDay : dateOnly;

  // check if card is already submitted
  const isExistCardSubmission = await dbClient.cardSubmission.findFirst({
    where: {
      userId: userId,
      companyId: companyId,
      submitDay: finalDate,
    },
  });

  // if (isExistCardSubmission) {
  //   throw new ApiError(StatusCodes.BAD_REQUEST, "Card is already submitted!");
  // }

  const isAction = actionTaken == "true" ? true : false;
  const isImmediateAction = immediateAction == "true" ? true : false;
  const isSubmitAnonymously = submitAnonymously == "true" ? true : false;

  const result = await dbClient.cardSubmission.create({
    data: {
      companyId: companyId,
      rigId: rigId,
      userId: userId,
      cardTypeId: Number(cardTypeId),
      areaId: Number(areaId),
      hazardId: Number(hazardId),
      description: description,
      riskSeverity: riskSeverity,
      file: file,
      fileType: fileType,
      actionTaken: isAction,
      immediateAction: isImmediateAction,
      submitAnonymously: isSubmitAnonymously,
      submitDay: finalDate,
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to submit card!");
  }

  return result;
};

// get type area hazard
export const getAllUserAreaTypeHazardService = async (
  companyId: any,
  rigId: any,
) => {
  const area = await dbClient.area.findMany({
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

  const hazard = await dbClient.hazard.findMany({
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

  const cardType = await dbClient.cardType.findMany({
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

  return { area, cardType, hazard };
};

// check card submission
export const checkCardSubmissionService = async (
  userId: any,
  companyId: any,
) => {
  const today = new Date();
  const dateOnly = today.toISOString().split("T")[0];

  // check if card is already submitted
  const isExistCardSubmission = await dbClient.cardSubmission.findFirst({
    where: {
      userId: userId,
      companyId: companyId,
      submitDay: dateOnly,
    },
  });

  if (isExistCardSubmission) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Today, Card is already submitted!, You can tomorrow submit card",
    );
  }

  return;
};

// get rig, area, type, hazard
export const getRigAreaTypeHazardService = async (companyId: any) => {
  const area = await dbClient.area.findMany({
    where: {
      companyId: companyId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  const hazard = await dbClient.hazard.findMany({
    where: {
      companyId: companyId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  const cardType = await dbClient.cardType.findMany({
    where: {
      companyId: companyId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  const rig = await dbClient.rig.findMany({
    where: {
      companyId: companyId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  return { area, cardType, hazard, rig };
};

// get card submission with search, filter and pagination
export const getCardSubmissionService = async (query: any, companyId: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const andConditions: Prisma.CardSubmissionWhereInput[] = [];

  if (companyId) {
    andConditions.push({
      companyId: Number(companyId),
    });
  } else {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Company ID is required!");
  }

  if (query.status) {
    andConditions.push({
      status: query.status as any,
    });
  } else {
    andConditions.push({
      NOT: {
        status: "DELETED",
      },
    });
  }

  if (query.rigId) {
    andConditions.push({
      rigId: Number(query.rigId),
    });
  }

  if (query.cardTypeId) {
    andConditions.push({
      cardTypeId: Number(query.cardTypeId),
    });
  }

  if (query.areaId) {
    andConditions.push({
      areaId: Number(query.areaId),
    });
  }

  if (query.submitDay) {
    andConditions.push({
      submitDay: query.submitDay,
    });
  }

  if (query.riskSeverity) {
    const validSeverities = ["LOW", "MEDIUM", "HIGH"];
    if (validSeverities.includes(query.riskSeverity as string)) {
      andConditions.push({
        riskSeverity: query.riskSeverity,
      });
    }
  }

  if (query.isOpened !== undefined && query.isOpened !== "") {
    andConditions.push({
      isOpened: query.isOpened === "true" || query.isOpened === true,
    });
  }

  if (query.immediateAction !== undefined && query.immediateAction !== "") {
    andConditions.push({
      immediateAction:
        query.immediateAction === "true" || query.immediateAction === true,
    });
  }

  if (query.search && query.search.trim() !== "") {
    const searchTerm = query.search.trim();

    andConditions.push({
      OR: [
        {
          user: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  const whereCondition: Prisma.CardSubmissionWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await dbClient.cardSubmission.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: {
      id: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: true,
          phone: true,
          position: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      rig: {
        select: {
          id: true,
          name: true,
        },
      },
      cardType: {
        select: {
          id: true,
          name: true,
        },
      },
      area: {
        select: {
          id: true,
          name: true,
        },
      },
      hazard: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const total = await dbClient.cardSubmission.count({
    where: whereCondition,
  });

  if (!result.length) {
    return {
      meta: {
        page,
        limit,
        total: 0,
        totalPage: 0,
      },
      data: [],
    };
  }

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};

// update card submission
export const updateCardSubmissionService = async (id: any, payload: any) => {
  const idNumber = parseInt(id);

  const { closureNotes, evidence } = payload;

  // check card submission exist
  const isExistCardSubmission = await dbClient.cardSubmission.findUnique({
    where: {
      id: idNumber,
    },
  });
  if (!isExistCardSubmission) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Card submission doesn't exist!",
    );
  }

  const result = await dbClient.cardSubmission.update({
    where: {
      id: idNumber,
    },
    data: {
      closureNotes: closureNotes,
      evidence: evidence,
      isOpened: true,
    },
  });

  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to update card submission!",
    );
  }

  return result;
};
