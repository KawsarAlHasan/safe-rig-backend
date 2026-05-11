import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../../../generated/prisma/client";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";
import { statusName } from "../../../../shared/statusName";
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

// // get Question and Anwsar
// export const getRigTypeService = async (query: any, companyId: any) => {
//   const andConditions: Prisma.RigTypeWhereInput[] = [];

//   // Search by name
//   if (query.search) {
//     andConditions.push({
//       name: {
//         contains: query.search,
//         mode: "insensitive",
//       },
//     });
//   }

//   // Status filter
//   if (!query.status) {
//     andConditions.push({
//       status: "ACTIVE",
//     });
//   } else if (query.status === "all") {
//     andConditions.push({
//       NOT: {
//         status: "DELETED",
//       },
//     });
//   } else {
//     andConditions.push({
//       status: query.status,
//     });
//   }

//   // Filter by isDefault
//   if (query.isDefault !== undefined) {
//     andConditions.push({
//       isDefault: query.isDefault === "true" || query.isDefault === true,
//     });
//   }

//   if (companyId) {
//     andConditions.push({
//       companyId: Number(companyId),
//     });
//   } else if (query.companyId) {
//     andConditions.push({
//       companyId: Number(query.companyId),
//     });
//   }

//   // Filter by rigIds (array contains)
//   if (query.rigId) {
//     andConditions.push({
//       rigIds: {
//         has: Number(query.rigId), // PostgreSQL array filter
//       },
//     });
//   }

//   // multiple rigIds support
//   if (query.rigIds) {
//     const ids = query.rigIds.split(",").map((id: string) => Number(id));

//     andConditions.push({
//       rigIds: {
//         hasSome: ids,
//       },
//     });
//   }

//   const whereCondition: Prisma.RigTypeWhereInput =
//     andConditions.length > 0 ? { AND: andConditions } : {};

//   const result = await dbClient.questionAnwser.findMany({
//     where: whereCondition, // FIXED (important)
//     orderBy: {
//       id: "desc",
//     },
//   });

//   if (!result) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch Question and Anwsar!");
//   }

//   if (result.length === 0) {
//     throw new ApiError(StatusCodes.NOT_FOUND, "No Question and Anwsars found!");
//   }

//   return result;
// };

// // Update an existing Question and Anwsar
// export const updateRigTypeService = async (payload: any, companyId: any) => {
//   const { id, name, isDefault, isAllRigs, rigIds } = payload;

//   // check Question and Anwsar exist
//   const isExistRigType = await dbClient.questionAnwser.findUnique({
//     where: { id: id },
//   });

//   if (!isExistRigType) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Question and Anwsar doesn't exist!");
//   }

//   // check duplicate name
//   if (name && name !== isExistRigType.name) {
//     const isDuplicateName = await dbClient.questionAnwser.findFirst({
//       where: { companyId: companyId, name: name },
//     });

//     if (isDuplicateName) {
//       throw new ApiError(
//         StatusCodes.BAD_REQUEST,
//         `Question and Anwsar with name ${name} already exists!`,
//       );
//     }
//   }

//   // update Question and Anwsar
//   const result = await dbClient.questionAnwser.update({
//     where: { id: id },
//     data: {
//       name: name || isExistRigType.name,
//       isDefault: isDefault || isExistRigType.isDefault,
//       companyId: companyId || isExistRigType.companyId,
//       isAllRigs: isAllRigs || isExistRigType.isAllRigs,
//       rigIds: rigIds || isExistRigType.rigIds,
//     },
//   });

//   if (!result) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update Question and Anwsar!");
//   }

//   return result;
// };

// // status change
// export const changeRigTypeStatusService = async (
//   payload: any,
//   companyId: any,
// ) => {
//   const { id, status } = payload;

//   if (!statusName.includes(status)) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       `Invalid status! You can only change status to ${statusName}`,
//     );
//   }

//   // build where condition
//   const whereCondition: any = { id };

//   if (companyId) {
//     whereCondition.companyId = companyId;
//   }

//   // check RigType exist
//   const isExistRigType = await dbClient.questionAnwser.findUnique({
//     where: whereCondition,
//   });
//   if (!isExistRigType) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Question and Anwsar doesn't exist!");
//   }

//   // status change
//   const result = await dbClient.questionAnwser.update({
//     where: { id: id },
//     data: {
//       status: status,
//     },
//   });

//   if (!result) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to status change!");
//   }

//   return result;
// };

// // permanent Question and Anwsar delete
// export const deleteRigTypeService = async (paramsId: any, companyId: any) => {
//   const id = parseInt(paramsId);

//   // build where condition
//   const whereCondition: any = { id };

//   if (companyId) {
//     whereCondition.companyId = companyId;
//   }

//   // check Question and Anwsar exist
//   const isExistRigType = await dbClient.questionAnwser.findUnique({
//     where: whereCondition,
//   });
//   if (!isExistRigType) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Question and Anwsar doesn't exist!");
//   }

//   // delete Question and Anwsar
//   const result = await dbClient.questionAnwser.delete({
//     where: { id: id },
//   });

//   if (!result) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete Question and Anwsar!");
//   }

//   return result;
// };
