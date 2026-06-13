import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { dbClient } from "../../../lib/prisma";
import { z } from "zod"; // optional but recommended

// Type-safe model map
const modelMap = {
  user: dbClient.user,
  rigAdmin: dbClient.rigAdmin,
  rig: dbClient.rig,
  company: dbClient.company,
  client: dbClient.client,
  cardSubmission: dbClient.cardSubmission,
  admin: dbClient.admin,
  adminRole: dbClient.adminRole,
  hazard: dbClient.hazard,
  message: dbClient.message,
  rigType: dbClient.rigType,
  videos: dbClient.videos,
  alert: dbClient.alert,
  area: dbClient.area,
  cardType: dbClient.cardType,
  activity: dbClient.activity,
  debriefQuestion: dbClient.debriefQuestion,
  dailyDebrief: dbClient.dailyDebrief,
  typeOfDevrief: dbClient.typeOfDevrief,
  questionAnwser: dbClient.questionAnwser,
  gameResult: dbClient.gameResult,
  puzzle: dbClient.puzzle,
  coupon: dbClient.coupon,
  plan: dbClient.plan,
} as const;

type ModelName = keyof typeof modelMap;

// Validation schema (optional but best practice)
const StatusUpdateSchema = z.object({
  id: z.string().min(1, "ID is required"),
  status: z.enum([
    "ACTIVE",
    "PENDING",
    "INACTIVE",
    "SUSPENDED",
    "DELETED",
    "NOT_SUBMITTED",
  ]),
  table: z.enum([
    "user",
    "rigAdmin",
    "rig",
    "company",
    "client",
    "cardSubmission",
    "admin",
    "adminRole",
    "hazard",
    "message",
    "rigType",
    "videos",
    "alert",
    "area",
    "cardType",
    "activity",
    "dailyDebrief",
    "debriefQuestion",
    "typeOfDevrief",
    "questionAnwser",
    "gameResult",
    "puzzle",
    "coupon",
    "plan",
  ]),
});

type StatusUpdatePayload = z.infer<typeof StatusUpdateSchema>;

// Main service function
export const globalStatusService = async (payload: StatusUpdatePayload) => {
  const { id, status, table } = payload;

  // Validate table (already handled by zod, but keeping for safety)
  if (!modelMap[table]) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Invalid table: ${table}`);
  }

  // Get model with proper typing
  const model = modelMap[table];

  // Check if exists
  const isExist = await (model as any).findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      `${table} with id ${id} doesn't exist!`,
    );
  }

  // Update status
  const result = await (model as any).update({
    where: { id },
    data: { status },
  });

  return result;
};

// get rig, area, type, hazard
export const getRigAreaTypeHazardService = async (
  companyId: any,
  query: any,
) => {
  let area: any = [];
  let hazard: any = [];
  let cardType: any = [];
  let rig: any = [];
  let rigType: any = [];

  if (query.area) {
    const result = await dbClient.area.findMany({
      where: {
        companyId: companyId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    area = result;
  }

  if (query.hazard) {
    const result = await dbClient.hazard.findMany({
      where: {
        companyId: companyId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    hazard = result;
  }

  if (query.cardType) {
    const result = await dbClient.cardType.findMany({
      where: {
        companyId: companyId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    cardType = result;
  }

  if (query.rig) {
    const result = await dbClient.rig.findMany({
      where: {
        companyId: companyId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    rig = result;
  }

  if (query.rigType) {
    const result = await dbClient.rigType.findMany({
      where: {
        companyId: companyId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    rigType = result;
  }

  return { area, hazard, cardType, rig, rigType };
};

// get admin dashboard overview
export const getAdminDashboardOverviewService = async () => {
  const companyCount = await dbClient.company.count();

  const rigCount = await dbClient.rig.count();

  const userCount = await dbClient.user.count();

  const totalApprovedHeatmap = await dbClient.heatmap.count({
    where: {
      status: "APPROVED",
    },
  });

  const totalPendingHeatmap = await dbClient.heatmap.count({
    where: {
      status: "PENDING",
    },
  });

  // Sum of all active subscription prices
  const totalSubscriptionBuyMoney = await dbClient.subscriptions.aggregate({
    where: {
      status: "ACTIVE",
    },
    _sum: {
      price: true,
    },
  });

  return {
    companyCount,
    rigCount,
    userCount,
    totalApprovedHeatmap,
    totalPendingHeatmap,
    totalSubscriptionBuyMoney: totalSubscriptionBuyMoney._sum.price || 0,
  };
};

// get client dashboard overview
export const getClientDashboardOverviewService = async (
  companyId: any,
  rigId?: any,
  startDate?: any,
  endDate?: any,
) => {
  const cardWhere: any = {
    companyId,
  };

  if (rigId) {
    cardWhere.rigId = rigId;
  }

  if (startDate && endDate) {
    cardWhere.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const userWhere: any = {
    companyId,
  };

  if (rigId) {
    userWhere.rigId = rigId;
  }

  const [
    totalCards,
    totalOpenCards,
    totalClosedCards,
    urgentActionRequired,
    todaysSubmittingCard,
    totalUsers,

    // Chart Data
    cardSubmissionChartsData,

    // Card Type Distribution
    cardsByCardType,

    // Recent Cards
    recentSubmitedCards,
  ] = await Promise.all([
    // ==========================
    // Dashboard Overview
    // ==========================
    dbClient.cardSubmission.count({
      where: cardWhere,
    }),

    dbClient.cardSubmission.count({
      where: {
        ...cardWhere,
        isOpened: true,
      },
    }),

    dbClient.cardSubmission.count({
      where: {
        ...cardWhere,
        isOpened: false,
      },
    }),

    dbClient.cardSubmission.count({
      where: {
        ...cardWhere,
        riskSeverity: "HIGH",
      },
    }),

    dbClient.cardSubmission.count({
      where: {
        companyId,
        ...(rigId && { rigId }),
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),

    dbClient.user.count({
      where: userWhere,
    }),

    // ==========================
    // Charts Data
    // ==========================
    dbClient.cardSubmission.groupBy({
      by: ["submitDay"],
      where: cardWhere,
      _count: {
        id: true,
      },
      orderBy: {
        submitDay: "asc",
      },
    }),

    // ==========================
    // Card Type Wise %
    // ==========================
    dbClient.cardSubmission.groupBy({
      by: ["cardTypeId"],
      where: cardWhere,
      _count: {
        id: true,
      },
    }),

    // ==========================
    // Recent 10 Cards
    // ==========================
    dbClient.cardSubmission.findMany({
      where: cardWhere,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        cardType: {
          select: {
            id: true,
            name: true,
          },
        },
        area: {
          select: {
            id: true,
            name: true,
          },
        },
        hazard: {
          select: {
            id: true,
            name: true,
          },
        },
        rig: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),
  ]);

  // ====================================
  // Card Type Percentage Calculation
  // ====================================

  const totalCardCount =
    cardsByCardType.reduce((sum, item) => sum + item._count.id, 0) || 1;

  const cardTypeIds = cardsByCardType
    .map((item) => item.cardTypeId)
    .filter(Boolean);

  const cardTypes = await dbClient.cardType.findMany({
    where: {
      id: {
        in: cardTypeIds as number[],
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const cardsByCardTypeWithPercentage = cardsByCardType.map((item) => {
    const cardType = cardTypes.find((ct) => ct.id === item.cardTypeId);

    return {
      cardTypeId: item.cardTypeId,
      cardTypeName: cardType?.name || "Unknown",
      total: item._count.id,
      percentage: Number(((item._count.id / totalCardCount) * 100).toFixed(2)),
    };
  });

  // ====================================
  // Chart Response Format
  // ====================================

  const chartData = cardSubmissionChartsData.map((item) => ({
    date: item.submitDay,
    total: item._count.id,
  }));

  return {
    dashboard: {
      totalCards,
      totalOpenCards,
      totalClosedCards,
      urgentActionRequired,
      todaysSubmittingCard,
      totalUsers,
    },

    cardSubmissionChartsData: chartData,

    cardsByCardType: cardsByCardTypeWithPercentage,

    recentSubmitedCards,
  };
};

// get company analysis
export const getCompanyAnalysisService = async (
  companyId: any,
  rigId?: any,
  startDate?: any,
  endDate?: any,
) => {
  const cardWhere: any = {
    companyId,
  };

  if (rigId) {
    cardWhere.rigId = rigId;
  }

  if (startDate && endDate) {
    cardWhere.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const userWhere: any = {
    companyId,
  };

  if (rigId) {
    userWhere.rigId = rigId;
  }

  const [
    totalCards,
    totalOpenCards,
    totalClosedCards,
    urgentActionRequired,
    todaysSubmittingCard,
    totalUsers,

    // Chart Data
    cardSubmissionChartsData,

    // Area Wise Cards
    areaWiseCards,

    // Hazard Wise Cards
    hazardWiseCards,
  ] = await Promise.all([
    // ==========================
    // Dashboard Overview
    // ==========================
    dbClient.cardSubmission.count({
      where: cardWhere,
    }),

    dbClient.cardSubmission.count({
      where: {
        ...cardWhere,
        isOpened: true,
      },
    }),

    dbClient.cardSubmission.count({
      where: {
        ...cardWhere,
        isOpened: false,
      },
    }),

    dbClient.cardSubmission.count({
      where: {
        ...cardWhere,
        riskSeverity: "HIGH",
      },
    }),

    dbClient.cardSubmission.count({
      where: {
        companyId,
        ...(rigId && { rigId }),
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),

    dbClient.user.count({
      where: userWhere,
    }),

    // ==========================
    // Charts Data
    // ==========================
    dbClient.cardSubmission.groupBy({
      by: ["submitDay"],
      where: cardWhere,
      _count: {
        id: true,
      },
      orderBy: {
        submitDay: "asc",
      },
    }),

    // ==========================
    // Area Wise Cards
    // ==========================
    dbClient.cardSubmission.groupBy({
      by: ["areaId"],
      where: cardWhere,
      _count: {
        id: true,
      },
    }),

    // ==========================
    // Hazard Wise Cards
    // ==========================
    dbClient.cardSubmission.groupBy({
      by: ["hazardId"],
      where: cardWhere,
      _count: {
        id: true,
      },
    }),
  ]);

  // ====================================
  // Area Wise Data Formatting
  // ====================================

  const areaIds = areaWiseCards.map((item) => item.areaId).filter(Boolean);

  const areas = await dbClient.area.findMany({
    where: {
      id: {
        in: areaIds as number[],
      },
    },
    select: {
      id: true,
      name: true,
      color: true,
    },
  });

  const areaWiseCardsWithDetails = areaWiseCards.map((item) => {
    const area = areas.find((a) => a.id === item.areaId);
    return {
      areaId: item.areaId,
      areaName: area?.name || "Unknown",
      areaColor: area?.color || null,
      total: item._count.id,
    };
  });

  // ====================================
  // Hazard Wise Data Formatting
  // ====================================

  const hazardIds = hazardWiseCards
    .map((item) => item.hazardId)
    .filter(Boolean);

  const hazards = await dbClient.hazard.findMany({
    where: {
      id: {
        in: hazardIds as number[],
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const hazardWiseCardsWithDetails = hazardWiseCards.map((item) => {
    const hazard = hazards.find((h) => h.id === item.hazardId);
    return {
      hazardId: item.hazardId,
      hazardName: hazard?.name || "Unknown",
      total: item._count.id,
    };
  });

  // ====================================
  // Chart Response Format
  // ====================================

  const chartData = cardSubmissionChartsData.map((item) => ({
    date: item.submitDay,
    total: item._count.id,
  }));

  return {
    dashboard: {
      totalCards,
      totalOpenCards,
      totalClosedCards,
      urgentActionRequired,
      todaysSubmittingCard,
      totalUsers,
    },

    cardSubmissionChartsData: chartData,
    areaWiseCards: areaWiseCardsWithDetails,
    hazardWiseCards: hazardWiseCardsWithDetails,
  };
};
