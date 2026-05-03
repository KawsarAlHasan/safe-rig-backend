import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../../../generated/prisma/client";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";
import { statusName } from "../../../../shared/statusName";
import { IQuery } from "../../../../types/company";
import unlinkFile from "../../../../shared/unlinkFile";

// create new Puzzle
export const puzzleCreateService = async (payloadData: any) => {
  const { image, title, marks, time } = payloadData;

  // await dbClient.puzzle.deleteMany({});

  // create new Puzzle on prisma dbClient
  const result = await dbClient.puzzle.create({
    data: {
      image: image,
      title: title,
      marks: marks,
      time: parseInt(time),
    },
  });

  // check role creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create Puzzle!");
  }

  return result;
};

// get all Puzzle
export const getAllPuzzleService = async (query: IQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const andConditions: Prisma.PuzzleWhereInput[] = [];

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

  const whereCondition: Prisma.PuzzleWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await dbClient.puzzle.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: {
      id: "desc",
    },
  });

  const total = await dbClient.puzzle.count({
    where: whereCondition,
  });

  if (!result.length) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No Puzzles found!");
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

// delete Puzzle
export const deletePuzzleService = async (id: any) => {
  const idNumber = parseInt(id);

  // check
  const isExistInData = await dbClient.puzzle.findFirst({
    where: {
      id: idNumber,
    },
  });

  if (!isExistInData) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Puzzle doesn't exist!");
  }

  if (isExistInData.image) {
    unlinkFile(isExistInData.image);
  }

  const result = await dbClient.puzzle.delete({
    where: { id: idNumber },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete Puzzle!");
  }

  return result;
};
