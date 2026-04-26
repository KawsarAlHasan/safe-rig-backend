import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../../generated/prisma/client";
import ApiError from "../../../errors/ApiError";
import { dbClient } from "../../../lib/prisma";
import { statusName } from "../../../shared/statusName";

// get my notification
export const getMyNotificationService = async (id: any) => {
  const result = await dbClient.notification.findMany({
    where: {
      userId: id,
    },
    orderBy: {
      id: "desc",
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to get notification!");
  }

  return result;
};

// change isRead
export const changeIsReadService = async (id: any, userId: any) => {
  const result = await dbClient.notification.updateMany({
    where: {
      id: parseInt(id),
      userId: userId,
    },
    data: {
      isRead: true,
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to change isRead!");
  }

  return result;
};
