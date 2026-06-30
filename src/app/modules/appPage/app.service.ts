import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { dbClient } from "../../../lib/prisma";

// // get home page
// export const getHomeServices = async (rigId: any, companyId: any) => {
//   const messages = await dbClient.message.findFirst({
//     where: {
//       companyId: companyId,
//       status: "ACTIVE",
//       OR: [
//         {
//           rigIds: {
//             has: rigId,
//           },
//         },
//         {
//           isAllRigs: true,
//         },
//       ],
//     },
//     orderBy: {
//       id: "desc",
//     },
//   });
//   const videos = await dbClient.videos.findFirst({
//     where: {
//       companyId: companyId,
//       status: "ACTIVE",
//       position: "homepage",
//       OR: [
//         {
//           rigIds: {
//             has: rigId,
//           },
//         },
//         {
//           isAllRigs: true,
//         },
//       ],
//     },
//     orderBy: {
//       id: "desc",
//     },
//   });

//   const result = {
//     messages,
//     videos,
//   };

//   return result;
// };

//set home page content
export const setHomePageVideoAndImage = async (payloadData: any) => {
  const { companyId, messageId, videoId } = payloadData;

  const existing = await dbClient.appHome.findFirst({
    where: { companyId },
  });

  if (existing) {
    return await dbClient.appHome.update({
      where: { id: existing.id },
      data: {
        messageId,
        videoId,
      },
    });
  }

  return await dbClient.appHome.create({
    data: {
      companyId,
      messageId,
      videoId,
    },
  });
};

// get home page
export const getHomeService = async (rigId: any, companyId: number) => {
  const appHome = await dbClient.appHome.findFirst({
    where: {
      companyId,
    },
    include: {
      message: true,
      videos: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  // AppHome exists
  if (appHome) {
    return {
      messages: appHome.message,
      videos: appHome.videos,
    };
  }

  // AppHome doesn't exist
  const [messages, videos] = await Promise.all([
    dbClient.message.findFirst({
      where: {
        companyId,
        status: "ACTIVE",
      },
      orderBy: {
        id: "desc",
      },
    }),

    dbClient.videos.findFirst({
      where: {
        companyId,
        status: "ACTIVE",
        position: "homepage",
      },
      orderBy: {
        id: "desc",
      },
    }),
  ]);

  return {
    messages,
    videos,
  };
};
