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

// update status
export const updateHeatmapStatusService = async (payload: any) => {
  const { id, status } = payload;

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
      status: status,
    },
  });

  return result;
};
