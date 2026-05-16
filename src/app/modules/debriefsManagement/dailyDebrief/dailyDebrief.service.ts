import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../../../generated/prisma/client";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";
import { statusName } from "../../../../shared/statusName";

// submit a debrief
export const createDebriefService = async (payload: any) => {
  const {
    companyId,
    rigId,
    userId,
    activityId,
    typeOfDevriefId,
    whatHappend,
    whatWorkedWell,
    whatImproved,
    submitDay,
    submitAnonymously,
  } = payload;

  const today = new Date();
  const dateOnly = today.toISOString().split("T")[0];

  const finalDate = submitDay ? submitDay : dateOnly;

  // // check if card is already submitted
  // const isExistDailyDebrief = await dbClient.dailyDebrief.findFirst({
  //   where: {
  //     userId: userId,
  //     companyId: companyId,
  //     rigId: rigId,
  //     submitDay: finalDate,
  //   },
  // });

  // if (isExistDailyDebrief) {
  //   throw new ApiError(StatusCodes.BAD_REQUEST, "Debrief is already submitted!");
  // }

  const isSubmitAnonymously = submitAnonymously == "true" ? true : false;

  const dailyDebrief = await dbClient.dailyDebrief.create({
    data: {
      userId: userId,
      companyId: companyId,
      rigId: rigId,
      activityId: activityId,
      typeOfDevriefId: typeOfDevriefId,
      whatHappend: whatHappend,
      whatWorkedWell: whatWorkedWell,
      whatImproved: whatImproved,
      submitDay: finalDate,
      submitAnonymously: isSubmitAnonymously,
    },
  });

  if (!dailyDebrief) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Debrief is already submitted!",
    );
  }

  return dailyDebrief;
};

// get all active debrief
export const getAllActiveDebriefService = async (
  companyId: any,
  rigId: any,
) => {
  const activity = await dbClient.activity.findMany({
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

  const typeOfDevrief = await dbClient.typeOfDevrief.findMany({
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

  return { activity, typeOfDevrief };
};

// check debrief
export const checkDebriefService = async (userId: any, companyId: any) => {
  const today = new Date();
  const dateOnly = today.toISOString().split("T")[0];

  // check if card is already submitted
  const isExistdailyDebrief = await dbClient.dailyDebrief.findFirst({
    where: {
      userId: userId,
      companyId: companyId,
      submitDay: dateOnly,
    },
  });

  const result = isExistdailyDebrief ? false : true;

  return result;
};

// get card submission with search, filter and pagination
export const getDebriefCardSubmissionService = async (
  query: any,
  companyId: any,
  rigIdResolve: any,
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const andConditions: Prisma.DailyDebriefWhereInput[] = [];

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

  if (rigIdResolve) {
    andConditions.push({
      rigId: Number(rigIdResolve),
    });
  } else if (query.rigId) {
    andConditions.push({
      rigId: Number(query.rigId),
    });
  }

  if (query.activityId) {
    andConditions.push({
      activityId: Number(query.activityId),
    });
  }

  if (query.typeOfDevriefId) {
    andConditions.push({
      typeOfDevriefId: Number(query.typeOfDevriefId),
    });
  }

  if (query.submitDay) {
    andConditions.push({
      submitDay: query.submitDay,
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
      ],
    });
  }

  const whereCondition: Prisma.DailyDebriefWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await dbClient.dailyDebrief.findMany({
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
      activity: {
        select: {
          id: true,
          name: true,
        },
      },
      typeOfDevrief: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const total = await dbClient.dailyDebrief.count({
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
