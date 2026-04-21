import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../../../generated/prisma/client";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";
import { statusName } from "../../../../shared/statusName";

// create new Puzzle
export const puzzleCreateService = async (payloadData: any) => {
  const {
    image,
    title,
    mark1x,
    mark1y,
    mark2x,
    mark2y,
    mark3x,
    mark3y,
    mark4x,
    mark4y,
    time,
  } = payloadData;

  // create new Puzzle on prisma dbClient
  const result = await dbClient.puzzle.create({
    data: {
      image: image,
      title: title,
      mark1x: parseFloat(mark1x),
      mark1y: parseFloat(mark1y),
      mark2x: parseFloat(mark2x),
      mark2y: parseFloat(mark2y),
      mark3x: parseFloat(mark3x),
      mark3y: parseFloat(mark3y),
      mark4x: parseFloat(mark4x),
      mark4y: parseFloat(mark4y),
      time: parseInt(time),
    },
  });

  // check role creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create Puzzle!");
  }

  console.log(result);

  return "result";
};
