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

// // get single heatmap with card data
// export const getSingleHeatmapWithCardService = async (payload: any) => {
//   const { id, companyId } = payload;
//   const idNumber = parseInt(id);

//   // heatmap find
//   const heatmap = await dbClient.heatmap.findUnique({
//     where: {
//       id: idNumber,
//       companyId,
//     },
//     include: {
//       rig: true,
//       areas: {
//         include: {
//           area: true,
//         },
//       },
//     },
//   });

//   if (!heatmap) {
//     throw new ApiError(StatusCodes.NOT_FOUND, "Heatmap not found!");
//   }

//   const rigId = heatmap.rigId;

//   // heatmap এর সব areaId collect
//   const areaIds = heatmap.areas.map((item: any) => item.areaId);

//   // area + severity wise card count
//   const groupedCards = await dbClient.cardSubmission.groupBy({
//     by: ["areaId", "riskSeverity"],
//     where: {
//       rigId,
//       companyId,
//       areaId: {
//         in: areaIds,
//       },
//       status: "ACTIVE",
//     },
//     _count: {
//       _all: true,
//     },
//   });

//   // area wise summary create
//   const areaWiseCards = heatmap.areas.map((item: any) => {
//     const areaId = item.areaId;

//     const areaCards = groupedCards.filter(
//       (card) => card.areaId === areaId
//     );

//     const low =
//       areaCards.find((c) => c.riskSeverity === "LOW")?._count._all || 0;

//     const medium =
//       areaCards.find((c) => c.riskSeverity === "MEDIUM")?._count._all || 0;

//     const high =
//       areaCards.find((c) => c.riskSeverity === "HIGH")?._count._all || 0;

//     const total = low + medium + high;

//     return {
//       id: item?.id,
//       mostCard: false,
//       areaId,
//       areaName: item?.area?.name,
//       areaColor: item?.area?.color,
//       cardSummary: {
//         total,
//         low,
//         medium,
//         high,
//       },
//       points: item?.points,
//     };
//   });


//   let mostCardArea: any = null;

//   for (const area of areaWiseCards) {
//     if (!mostCardArea) {
//       mostCardArea = area;
//       continue;
//     }

//     const currentTotal = area.cardSummary.total;
//     const selectedTotal = mostCardArea.cardSummary.total;

//     const currentHigh = area.cardSummary.high;
//     const selectedHigh = mostCardArea.cardSummary.high;

//     if (currentTotal > selectedTotal) {
//       mostCardArea = area;
//     }

//     // total equal  high compare
//     else if (currentTotal === selectedTotal) {
//       if (currentHigh > selectedHigh) {
//         mostCardArea = area;
//       }
//     }
//   }

//   // final areas with mostCard true
//   const finalAreas = areaWiseCards.map((area) => ({
//     ...area,
//     mostCard: area.areaId === mostCardArea?.areaId,
//   }));

//   // final response
//   return {
//     ...heatmap,
//     areas: finalAreas,
//   };
// };

// export const getSingleHeatmapWithCardService = async (payload: any) => {
//   const { id, companyId } = payload;
//   const idNumber = parseInt(id);

//   const heatmap = await dbClient.heatmap.findUnique({
//     where: { id: idNumber, companyId },
//     include: {
//       rig: true,
//       areas: { include: { area: true } },
//     },
//   });

//   if (!heatmap) {
//     throw new ApiError(StatusCodes.NOT_FOUND, "Heatmap not found!");
//   }

//   const rigId = heatmap.rigId;
//   const areaIds = heatmap.areas.map((item: any) => item.areaId);

//   // 1. area + severity grouping (কার্ডের পরিসংখ্যান)
//   const groupedCards = await dbClient.cardSubmission.groupBy({
//     by: ["areaId", "riskSeverity"],
//     where: {
//       rigId,
//       companyId,
//       areaId: { in: areaIds },
//       status: "ACTIVE",
//     },
//     _count: { _all: true },
//   });

//   // 2. প্রতি area এবং প্রতি hazard অনুযায়ী কার্ড সংখ্যা বের করা (areaId + hazardId ভিত্তিক)
//   const hazardCountsPerArea = await dbClient.cardSubmission.groupBy({
//     by: ["areaId", "hazardId"],
//     where: {
//       rigId,
//       companyId,
//       areaId: { in: areaIds },
//       status: "ACTIVE",
//       hazardId: { not: null },
//     },
//     _count: { _all: true },
//   });

//   // 3. সব unique hazardId-এর ডিটেইলস বের করা
//   const allHazardIds = [
//     ...new Set(hazardCountsPerArea.map((item) => item.hazardId).filter(Boolean)),
//   ];
//   const hazards = await dbClient.hazard.findMany({
//     where: { id: { in: allHazardIds } },
//     select: { id: true, name: true, isDefault: true, status: true },
//   });

//   // 4. হেল্পার ফাংশন: একটি area-এর জন্য top N hazards (কার্ড সংখ্যা অনুযায়ী সাজানো)
//   const getTopHazardsForArea = (areaId: number, limit: number = 10) => {
//     const areaHazards = hazardCountsPerArea.filter(
//       (item) => item.areaId === areaId && item.hazardId !== null
//     );
//     // কার্ড সংখ্যা descending অনুযায়ী সাজানো এবং limit পর্যন্ত নেওয়া
//     const sorted = areaHazards.sort((a, b) => b._count._all - a._count._all).slice(0, limit);
//     return sorted.map((item) => ({
//       hazard: hazards.find((h) => h.id === item.hazardId),
//       cardCount: item._count._all,
//     }));
//   };

//   // 5. area-wise summary তৈরি (এবার প্রতিটি area-তে topHazards যোগ করা হয়েছে)
//   const areaWiseCards = heatmap.areas.map((item: any) => {
//     const areaId = item.areaId;
//     const areaCards = groupedCards.filter((card) => card.areaId === areaId);
//     const low =
//       areaCards.find((c) => c.riskSeverity === "LOW")?._count._all || 0;
//     const medium =
//       areaCards.find((c) => c.riskSeverity === "MEDIUM")?._count._all || 0;
//     const high =
//       areaCards.find((c) => c.riskSeverity === "HIGH")?._count._all || 0;
//     const total = low + medium + high;

//     return {
//       id: item.id,
//       mostCard: false,
//       areaId,
//       areaName: item.area?.name,
//       areaColor: item.area?.color,
//       cardSummary: { total, low, medium, high },
//       points: item.points,
//       topHazards: getTopHazardsForArea(areaId, 10), // প্রতি area-র জন্য top 10 hazards
//     };
//   });

//   // 6. সবচেয়ে বেশি কার্ডের area নির্বাচন (আগের মতো)
//   let mostCardArea: any = null;
//   for (const area of areaWiseCards) {
//     if (!mostCardArea) mostCardArea = area;
//     else {
//       const currentTotal = area.cardSummary.total;
//       const selectedTotal = mostCardArea.cardSummary.total;
//       const currentHigh = area.cardSummary.high;
//       const selectedHigh = mostCardArea.cardSummary.high;
//       if (currentTotal > selectedTotal) mostCardArea = area;
//       else if (currentTotal === selectedTotal && currentHigh > selectedHigh)
//         mostCardArea = area;
//     }
//   }

//   const finalAreas = areaWiseCards.map((area) => ({
//     ...area,
//     mostCard: area.areaId === mostCardArea?.areaId,
//   }));

//   // 7. ফাইনাল রেসপন্স
//   return {
//     ...heatmap,
//     areas: finalAreas,
//   };
// };

export const getSingleHeatmapWithCardService = async (payload: any) => {
  const { id, companyId } = payload;
  const idNumber = parseInt(id);

  const heatmap = await dbClient.heatmap.findUnique({
    where: { id: idNumber, companyId },
    include: {
      rig: true,
      areas: { include: { area: true } },
    },
  });

  if (!heatmap) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Heatmap not found!");
  }

  const rigId = heatmap.rigId;
  const areaIds = heatmap.areas.map((item: any) => item.areaId);

  // 1. area + severity grouping
  const groupedCards = await dbClient.cardSubmission.groupBy({
    by: ["areaId", "riskSeverity"],
    where: {
      rigId,
      companyId,
      areaId: { in: areaIds },
      status: "ACTIVE",
    },
    _count: { _all: true },
  });

  // 2. Count cards per area + hazard
  const hazardCountsPerArea = await dbClient.cardSubmission.groupBy({
    by: ["areaId", "hazardId"],
    where: {
      rigId,
      companyId,
      areaId: { in: areaIds },
      status: "ACTIVE",
      hazardId: { not: null },
    },
    _count: { _all: true },
  });

  // 3. Fetch hazard details – fixed TypeScript error
  const allHazardIds = [
    ...new Set(
      hazardCountsPerArea
        .map((item) => item.hazardId)
        .filter((id): id is number => id !== null)
    ),
  ];
  const hazards = await dbClient.hazard.findMany({
    where: { id: { in: allHazardIds } },
    select: { id: true, name: true, isDefault: true, status: true },
  });

  // 4. Helper: top N hazards for a given area
  const getTopHazardsForArea = (areaId: number, limit: number = 10) => {
    const areaHazards = hazardCountsPerArea.filter(
      (item) => item.areaId === areaId && item.hazardId !== null
    );
    const sorted = areaHazards.sort((a, b) => b._count._all - a._count._all).slice(0, limit);
    return sorted.map((item) => ({
      hazard: hazards.find((h) => h.id === item.hazardId),
      cardCount: item._count._all,
    }));
  };

  // 5. Build area-wise cards summary (including top hazards per area)
  const areaWiseCards = heatmap.areas.map((item: any) => {
    const areaId = item.areaId;
    const areaCards = groupedCards.filter((card) => card.areaId === areaId);
    const low = areaCards.find((c) => c.riskSeverity === "LOW")?._count._all || 0;
    const medium = areaCards.find((c) => c.riskSeverity === "MEDIUM")?._count._all || 0;
    const high = areaCards.find((c) => c.riskSeverity === "HIGH")?._count._all || 0;
    const total = low + medium + high;

    return {
      id: item.id,
      mostCard: false,
      areaId,
      areaName: item.area?.name,
      areaColor: item.area?.color,
      cardSummary: { total, low, medium, high },
      points: item.points,
      topHazards: getTopHazardsForArea(areaId, 10),
    };
  });

  // 6. Find area with most cards (by total, then high severity)
  let mostCardArea: any = null;
  for (const area of areaWiseCards) {
    if (!mostCardArea) mostCardArea = area;
    else {
      const currentTotal = area.cardSummary.total;
      const selectedTotal = mostCardArea.cardSummary.total;
      const currentHigh = area.cardSummary.high;
      const selectedHigh = mostCardArea.cardSummary.high;
      if (currentTotal > selectedTotal) mostCardArea = area;
      else if (currentTotal === selectedTotal && currentHigh > selectedHigh)
        mostCardArea = area;
    }
  }

  const finalAreas = areaWiseCards.map((area) => ({
    ...area,
    mostCard: area.areaId === mostCardArea?.areaId,
  }));

  // 7. Return final response
  return {
    ...heatmap,
    areas: finalAreas,
  };
};


// export const getSingleHeatmapWithCardService = async (payload: any) => {
//   const { id, companyId } = payload;
//   const idNumber = parseInt(id);

//   const heatmap = await dbClient.heatmap.findUnique({
//     where: { id: idNumber, companyId },
//     include: {
//       rig: true,
//       areas: { include: { area: true } },
//     },
//   });

//   if (!heatmap) {
//     throw new ApiError(StatusCodes.NOT_FOUND, "Heatmap not found!");
//   }

//   const rigId = heatmap.rigId;
//   const areaIds = heatmap.areas.map((item: any) => item.areaId);

//   // 1. Existing area+severity grouping
//   const groupedCards = await dbClient.cardSubmission.groupBy({
//     by: ["areaId", "riskSeverity"],
//     where: {
//       rigId,
//       companyId,
//       areaId: { in: areaIds },
//       status: "ACTIVE",
//     },
//     _count: { _all: true },
//   });

//   // 2. NEW: Get top 10 hazards by card count
//   const topHazards = await dbClient.cardSubmission.groupBy({
//     by: ["hazardId"],
//     where: {
//       rigId,
//       companyId,
//       areaId: { in: areaIds },
//       status: "ACTIVE",
//       hazardId: { not: null }, // exclude submissions without a hazard
//     },
//     _count: { _all: true },
//     orderBy: { _count: { _all: "desc" } },
//     take: 10,
//   });

//   // Fetch full hazard details for the found hazardIds
//   const hazardIds = topHazards.map((item: any) => item.hazardId!).filter(Boolean);
//   const hazards = await dbClient.hazard.findMany({
//     where: { id: { in: hazardIds } },
//     select: { id: true, name: true, isDefault: true, status: true },
//   });

//   // Combine count with hazard data
//   const topHazardsWithDetails = topHazards.map((item: any) => ({
//     hazard: hazards.find((h) => h.id === item.hazardId),
//     cardCount: item._count._all,
//   }));

//   // 3. Continue with area-wise summary (unchanged)
//   const areaWiseCards = heatmap.areas.map((item: any) => {
//     const areaId = item.areaId;
//     const areaCards = groupedCards.filter((card) => card.areaId === areaId);
//     const low = areaCards.find((c) => c.riskSeverity === "LOW")?._count._all || 0;
//     const medium = areaCards.find((c) => c.riskSeverity === "MEDIUM")?._count._all || 0;
//     const high = areaCards.find((c) => c.riskSeverity === "HIGH")?._count._all || 0;
//     const total = low + medium + high;
//     return {
//       id: item.id,
//       mostCard: false,
//       areaId,
//       areaName: item.area?.name,
//       areaColor: item.area?.color,
//       cardSummary: { total, low, medium, high },
//       points: item.points,
//     };
//   });

//   // Find most card area (unchanged)
//   let mostCardArea: any = null;
//   for (const area of areaWiseCards) {
//     if (!mostCardArea) mostCardArea = area;
//     else {
//       const currentTotal = area.cardSummary.total;
//       const selectedTotal = mostCardArea.cardSummary.total;
//       const currentHigh = area.cardSummary.high;
//       const selectedHigh = mostCardArea.cardSummary.high;
//       if (currentTotal > selectedTotal) mostCardArea = area;
//       else if (currentTotal === selectedTotal && currentHigh > selectedHigh)
//         mostCardArea = area;
//     }
//   }

//   const finalAreas = areaWiseCards.map((area) => ({
//     ...area,
//     mostCard: area.areaId === mostCardArea?.areaId,
//   }));

//   // 4. Return enhanced response
//   return {
//     ...heatmap,
//     areas: finalAreas,
//     topHazards: topHazardsWithDetails, // <-- new field
//   };
// };