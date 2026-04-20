import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { dbClient } from "../../../lib/prisma";

// get home page
export const getHomeService = async (rigId: any, companyId: any) => {
  const alerts = await dbClient.alert.findFirst({
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
  const videos = await dbClient.videos.findFirst({
    where: {
      companyId: companyId,
      status: "ACTIVE",
      position: "Homepage",
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

  const result = {
    alerts,
    videos,
  };

  return result;
};
