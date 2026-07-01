import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../../../generated/prisma/client";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";
import { IQuery } from "../../../../types/company";
import unlinkFile from "../../../../shared/unlinkFile";

// create new Question and Anwsar
export const questionCreateService = async (payloadData: any) => {
  const {
    image,
    question,
    option1,
    option2,
    option3,
    option4,
    correctAnswer,
    time,
    // isDefault,
    // companyId,
    // isAllRigs,
    // rigIds,
  } = payloadData;

  // const isDefaultCheck = isDefault == "true" ? true : false;
  // const numCompanyId = companyId ? Number(companyId) : companyId;
  // const isAllRigsCheck = isAllRigs == "true" ? true : false;
  // const numRigIds = rigIds ? Number(rigIds) : rigIds;

  // check Question and Anwsar name
  const isExistInAllRigs = await dbClient.questionAnwser.findFirst({
    where: {
      question: question,
    },
  });

  if (isExistInAllRigs) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Question and Anwsar already exists!",
    );
  }

  // create new Question and Anwsar on prisma dbClient
  const result = await dbClient.questionAnwser.create({
    data: {
      image: image,
      question: question,
      option1: option1,
      option2: option2,
      option3: option3,
      option4: option4,
      correctAnswer: parseInt(correctAnswer),
      time: parseInt(time),
      // isDefault: isDefaultCheck,
      // companyId: numCompanyId,
      // isAllRigs: isAllRigsCheck,
      // rigIds: numRigIds,
    },
  });

  // check role creation
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to create Question and Anwsar!",
    );
  }

  return result;
};

// update Question and Anwsar
export const updateQuestionCreateService = async (payloadData: any) => {
  const {
    id,
    image,
    question,
    option1,
    option2,
    option3,
    option4,
    correctAnswer,
    time,
  } = payloadData;

  // check Question and Anwsar name
  const isExistInAllRigs = await dbClient.questionAnwser.findFirst({
    where: {
      id: parseInt(id),
    },
  });

  if (!isExistInAllRigs) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Question and Anwsar doesn't exist!",
    );
  }

  // update new Question and Anwsar on prisma dbClient
  const result = await dbClient.questionAnwser.update({
    where: {
      id: parseInt(id),
    },
    data: {
      image: image ? image : isExistInAllRigs.image,
      question: question ? question : isExistInAllRigs.question,
      option1: option1 ? option1 : isExistInAllRigs.option1,
      option2: option2 ? option2 : isExistInAllRigs.option2,
      option3: option3 ? option3 : isExistInAllRigs.option3,
      option4: option4 ? option4 : isExistInAllRigs.option4,
      correctAnswer: correctAnswer
        ? parseInt(correctAnswer)
        : isExistInAllRigs.correctAnswer,
      time: time ? parseInt(time) : isExistInAllRigs.time,
    },
  });

  // check role creation
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to update Question and Anwsar!",
    );
  }

  return result;
};

// get all question
export const getAllQuestionService = async (query: IQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const andConditions: Prisma.QuestionAnwserWhereInput[] = [];

  if (query.isUser) {
    andConditions.push({
      isUsed: query.isUser as any,
    });
  }

  // status filter
  if (query.status) {
    andConditions.push({
      status: query.status as any,
    });
  } else {
    // exclude DELETED by default
    andConditions.push({
      NOT: {
        status: "DELETED",
      },
    });
  }

  const whereCondition: Prisma.QuestionAnwserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await dbClient.questionAnwser.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: {
      id: "desc",
    },
  });

  const total = await dbClient.questionAnwser.count({
    where: whereCondition,
  });

  if (!result.length) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No Question and Anwsars found!");
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

// delete Question and Anwsar
export const deleteQuestionService = async (id: any) => {
  const idNumber = parseInt(id);

  // check
  const isExistInQuestion = await dbClient.questionAnwser.findFirst({
    where: {
      id: idNumber,
    },
  });

  if (!isExistInQuestion) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Question and Anwsar doesn't exist!",
    );
  }

  if (isExistInQuestion.image) {
    unlinkFile(isExistInQuestion.image);
  }

  const result = await dbClient.questionAnwser.delete({
    where: { id: idNumber },
  });

  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to delete Question and Anwsar!",
    );
  }

  return result;
};
