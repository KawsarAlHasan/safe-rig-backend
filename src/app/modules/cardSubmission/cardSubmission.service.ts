import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { dbClient } from "../../../lib/prisma";

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
