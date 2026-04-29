import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../../generated/prisma/client";
import ApiError from "../../../errors/ApiError";
import { dbClient } from "../../../lib/prisma";
import { statusName } from "../../../shared/statusName";

// create heatmap
export const heatmapCreateService = async (payload: any) => {
  const { companyId, image, rigId, areas } = payload;

  // create heatmap  on prisma dbClient
  const result = await dbClient.heatmap.create({
    data: {
      companyId: companyId,
      rigId: Number(rigId), // rigId convert to number
      image: image,
      areas: {
        create: areas,
      },
    },
  });

  // check heatmap creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create heatmap!");
  }

  return result;
};

// get heatmap service with pagination and filters
export const heatmapGetService = async (query: any, companyId: any) => {
  const andConditions: Prisma.HeatmapWhereInput[] = [];

  // filter by companyId
  if (companyId) {
    andConditions.push({
      companyId: Number(companyId),
    });
  } else if (query.companyId) {
    andConditions.push({
      companyId: Number(query.companyId),
    });
  }

  // search by company name
  if (query.search) {
    andConditions.push({
      company: {
        name: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    });
  }

  // filter by rigId
  if (query.rigId) {
    andConditions.push({
      rigId: Number(query.rigId),
    });
  }

  // filter by status
  if (query.status && query.status !== "all") {
    andConditions.push({
      status: query.status,
    });
  }

  // filter by isApproved
  if (query.isApproved !== undefined) {
    andConditions.push({
      isApproved: query.isApproved === "true" || query.isApproved === true,
    });
  }

  // date range filter (optional but useful)
  if (query.startDate && query.endDate) {
    andConditions.push({
      createdAt: {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      },
    });
  }

  const whereCondition: Prisma.HeatmapWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // pagination
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    dbClient.heatmap.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: {
        id: "desc",
      },
      include: {
        company: {
          select: {
            name: true,
          },
        },
        rig: {
          select: {
            name: true,
          },
        },
        areas: {
          include: {
            area: true,
          },
        },
      },
    }),
    dbClient.heatmap.count({
      where: whereCondition,
    }),
  ]);

  if (!data || data.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No heatmaps found!");
  }

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data,
  };
};

// get single heatmap
export const getSingleHeatmapService = async (id: any) => {
  const idNumber = parseInt(id);

  const heatmap = await dbClient.heatmap.findUnique({
    where: {
      id: idNumber,
    },
    include: {
      company: true,
      rig: true,
      areas: {
        include: {
          area: true,
        },
      },
    },
  });

  if (!heatmap) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Heatmap not found!");
  }

  const areas = await dbClient.area.findMany({
    where: {
      companyId: heatmap.companyId,
      status: "ACTIVE",
      OR: [
        {
          rigIds: {
            has: heatmap.rigId,
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

  return {
    heatmap,
    areas,
  };
};

// update heatmap
export const updateHeatmapService = async (payload: any) => {
  const { id, areas } = payload;

  // check if heatmap exist
  const isExistHeatmap = await dbClient.heatmap.findUnique({
    where: { id },
  });
  if (!isExistHeatmap) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Heatmap not found!");
  }

  // update heatmap
  const result = await dbClient.heatmap.update({
    where: { id },
    data: {
      areas: {
        deleteMany: {},
        createMany: {
          data: areas,
        },
      },
    },
  });

  return result;
};

// // get rig
// export const getRigService = async (query: any, companyId: any) => {
//   const andConditions: Prisma.RigWhereInput[] = [];

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

//   if (companyId) {
//     andConditions.push({
//       companyId: Number(companyId),
//     });
//   } else if (query.companyId) {
//     andConditions.push({
//       companyId: Number(query.companyId),
//     });
//   }

//   const whereCondition: Prisma.RigWhereInput =
//     andConditions.length > 0 ? { AND: andConditions } : {};

//   const result = await dbClient.rig.findMany({
//     where: whereCondition,
//     orderBy: {
//       id: "desc",
//     },
//   });

//   if (!result) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch rig!");
//   }

//   if (result.length === 0) {
//     throw new ApiError(StatusCodes.NOT_FOUND, "No rig found!");
//   }

//   return result;
// };

// // Update an existing Rig
// export const updateRigService = async (payload: any, companyId: any) => {
//   const { id, name, location, latitude, longitude, rigTypeId } = payload;

//   // check rig  exist
//   const isExistRig = await dbClient.rig.findUnique({
//     where: { id: id },
//   });

//   if (!isExistRig) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Rig doesn't exist!");
//   }

//   // check duplicate name
//   if (name && name !== isExistRig.name) {
//     const isDuplicateName = await dbClient.rig.findFirst({
//       where: { companyId: companyId, name: name },
//     });

//     if (isDuplicateName) {
//       throw new ApiError(
//         StatusCodes.BAD_REQUEST,
//         `Rig with name ${name} already exists!`,
//       );
//     }
//   }

//   // update rig
//   const result = await dbClient.rig.update({
//     where: { id: id },
//     data: {
//       name: name || isExistRig.name,
//       companyId: companyId || isExistRig.companyId,
//       location: location || isExistRig.location,
//       latitude: latitude || isExistRig.latitude,
//       longitude: longitude || isExistRig.longitude,
//       rigTypeId: rigTypeId || isExistRig.rigTypeId,
//     },
//   });

//   if (!result) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update rig!");
//   }

//   return result;
// };

// // status change
// export const changeRigStatusService = async (payload: any, companyId: any) => {
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

//   // check Rig exist
//   const isExistRig = await dbClient.rig.findUnique({
//     where: whereCondition,
//   });
//   if (!isExistRig) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Rig doesn't exist!");
//   }

//   // status change
//   const result = await dbClient.rig.update({
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

// // permanent rig delete
// export const deleteRigService = async (paramsId: any, companyId: any) => {
//   const id = parseInt(paramsId);

//   // build where condition
//   const whereCondition: any = { id };

//   if (companyId) {
//     whereCondition.companyId = companyId;
//   }

//   // check rig  exist
//   const isExistRig = await dbClient.rig.findUnique({
//     where: whereCondition,
//   });
//   if (!isExistRig) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Rig doesn't exist!");
//   }

//   // delete rig
//   const result = await dbClient.rig.delete({
//     where: { id: id },
//   });

//   if (!result) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete rig!");
//   }

//   return result;
// };
