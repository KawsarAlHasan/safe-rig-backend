import { StatusCodes } from "http-status-codes";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";
import { Prisma } from "../../../../../generated/prisma/client";

// create new debrief question
export const createDebriefQuestionService = async (
  payload: any,
  companyId: any,
) => {
  const { question, placeholder, isDefault, isAllRigs, rigIds } = payload;

  // create new DebriefQuestion on prisma dbClient
  const result = await dbClient.debriefQuestion.create({
    data: {
      question: question,
      placeholder: placeholder,
      isDefault: isDefault,
      companyId: companyId,
      isAllRigs: isAllRigs,
      rigIds: rigIds,
    },
  });

  // check role creation
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to create debrief question!",
    );
  }

  return result;
};

// get all debrief question
export const getAllDebriefQuestionService = async (
  query: any,
  companyId: any,
) => {
  const andConditions: Prisma.DebriefQuestionWhereInput[] = [];

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

  const whereCondition: Prisma.DebriefQuestionWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const dbData = await dbClient.debriefQuestion.findMany({
    where: whereCondition,
    orderBy: {
      id: "desc",
    },
  });

  if (!dbData) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch Card Types!");
  }

  if (dbData.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No Card Types found!");
  }

  const allRigIds = dbData.flatMap((ct) => ct.rigIds);
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

  const result = dbData.map((cardType) => ({
    ...cardType,
    rigDetails: cardType.rigIds
      .map((rigId) => rigsMap.get(rigId))
      .filter((rig) => rig !== undefined),
  }));

  return result;
};

// update debrief question
export const updateDebriefQuestionService = async (
  payload: any,
  companyId: any,
) => {
  const { id, question, placeholder, isDefault, isAllRigs, rigIds } = payload;

  // check debrief question exist
  const isExistDebrief = await dbClient.debriefQuestion.findUnique({
    where: { id: id },
  });

  if (!isExistDebrief) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Debrief question doesn't exist!",
    );
  }

  // update Activity
  const result = await dbClient.debriefQuestion.update({
    where: { id: id },
    data: {
      question: question || isExistDebrief.question,
      placeholder: placeholder || isExistDebrief.placeholder,
      isDefault: isDefault || isExistDebrief.isDefault,
      companyId: companyId || isExistDebrief.companyId,
      isAllRigs: isAllRigs,
      rigIds: rigIds || isExistDebrief.rigIds,
    },
  });

  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to update debrief question!",
    );
  }

  return result;
};

// delete debrief question
export const deleteDebriefQuestionService = async (
  paramsId: any,
  companyId: any,
) => {
  const id = parseInt(paramsId);

  // build where condition
  const whereCondition: any = { id };

  if (companyId) {
    whereCondition.companyId = companyId;
  }

  // check Debrief Question exist
  const isExistDebriefQuestion = await dbClient.debriefQuestion.findUnique({
    where: whereCondition,
  });
  if (!isExistDebriefQuestion) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Debrief Question doesn't exist!",
    );
  }

  // delete Debrief Question
  const result = await dbClient.debriefQuestion.delete({
    where: { id: id },
  });

  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to delete Debrief Question!",
    );
  }

  return result;
};
