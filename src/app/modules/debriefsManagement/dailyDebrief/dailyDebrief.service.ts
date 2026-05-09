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

  // check if card is already submitted
  const isExistDailyDebrief = await dbClient.dailyDebrief.findFirst({
    where: {
      userId: userId,
      companyId: companyId,
      rigId: rigId,
      submitDay: finalDate,
    },
  });

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
