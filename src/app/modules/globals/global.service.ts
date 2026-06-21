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
export const getAdminDashboardOverviewService = async (
  startDate?: any,
  endDate?: any,
) => {
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

// get Admin dashboard overview
export const getAdminDashboardrvice = async (
  startDate?: any,
  endDate?: any,
) => {
  const todayDateStr = new Date().toLocaleDateString("en-CA");

  // ---- 1. Filters ----
  // For card & activity counts: if date range is given, filter by submitDay; otherwise no filter (all-time)
  const countDateFilter =
    startDate && endDate ? { submitDay: { gte: startDate, lte: endDate } } : {};

  // ---- 2. Determine date range for trends ----
  let trendStart: string, trendEnd: string;
  if (startDate && endDate) {
    trendStart = startDate;
    trendEnd = endDate;
  } else {
    // All-time: find the earliest date from all relevant tables
    const [minCard, minDebrief, minUser, minGame, minSub] = await Promise.all([
      dbClient.cardSubmission.findFirst({
        where: { status: "ACTIVE" },
        orderBy: { submitDay: "asc" },
        select: { submitDay: true },
      }),
      dbClient.dailyDebrief.findFirst({
        where: { status: "ACTIVE" },
        orderBy: { submitDay: "asc" },
        select: { submitDay: true },
      }),
      dbClient.user.findFirst({
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
      dbClient.gameResult.findFirst({
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
      dbClient.subscriptions.findFirst({
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
    ]);

    const dates: string[] = [];
    if (minCard?.submitDay) dates.push(minCard.submitDay);
    if (minDebrief?.submitDay) dates.push(minDebrief.submitDay);
    if (minUser?.createdAt)
      dates.push(minUser.createdAt.toISOString().split("T")[0]);
    if (minGame?.createdAt)
      dates.push(minGame.createdAt.toISOString().split("T")[0]);
    if (minSub?.createdAt)
      dates.push(minSub.createdAt.toISOString().split("T")[0]);

    // If no data at all, fallback to today
    if (dates.length === 0) {
      trendStart = todayDateStr;
      trendEnd = todayDateStr;
    } else {
      // Sort and take the earliest
      dates.sort();
      trendStart = dates[0];
      trendEnd = todayDateStr;
    }
  }

  const trendDates = getDateRange(trendStart, trendEnd);

  // ---- 3. Card by Company ----
  const cardCounts = await dbClient.cardSubmission.groupBy({
    by: ["companyId"],
    where: {
      ...countDateFilter,
      status: "ACTIVE",
    },
    _count: { id: true },
  });

  const companyIds = cardCounts
    .map((c) => c.companyId)
    .filter((id): id is number => id !== null);

  const companies = await dbClient.company.findMany({
    where: { id: { in: companyIds } },
    select: { id: true, name: true },
  });
  const companyNameMap = new Map(companies.map((c) => [c.id, c.name]));

  const cardByCompany = cardCounts.map((c) => ({
    companyId: c.companyId!,
    companyName: companyNameMap.get(c.companyId!) || "Unknown",
    totalCards: c._count.id,
  }));

  // ---- 4. Top Clients by Activity (based on companies) ----
  const cardActivityCounts = await dbClient.cardSubmission.groupBy({
    by: ["companyId"],
    where: {
      ...countDateFilter,
      status: "ACTIVE",
    },
    _count: { id: true },
  });

  const debriefActivityCounts = await dbClient.dailyDebrief.groupBy({
    by: ["companyId"],
    where: {
      ...countDateFilter,
      status: "ACTIVE",
    },
    _count: { id: true },
  });

  const activityMap = new Map<number, number>();
  [...cardActivityCounts, ...debriefActivityCounts].forEach((item) => {
    if (item.companyId !== null) {
      const current = activityMap.get(item.companyId) || 0;
      activityMap.set(item.companyId, current + item._count.id);
    }
  });

  const activityCompanyIds = Array.from(activityMap.keys());
  const activityCompanies = await dbClient.company.findMany({
    where: { id: { in: activityCompanyIds } },
    select: { id: true, name: true },
  });
  const activityCompanyMap = new Map(
    activityCompanies.map((c) => [c.id, c.name]),
  );

  // Calculate top clients by activity with detailed breakdown
  const topClientsPromises = Array.from(activityMap.entries()).map(
    async ([companyId, totalActivity]) => {
      // Get detailed activity data for each company
      const [cardCount, debriefCount, userCount, gameCount] = await Promise.all(
        [
          dbClient.cardSubmission.count({
            where: {
              companyId: companyId,
              ...countDateFilter,
              status: "ACTIVE",
            },
          }),
          dbClient.dailyDebrief.count({
            where: {
              companyId: companyId,
              ...countDateFilter,
              status: "ACTIVE",
            },
          }),
          dbClient.user.count({
            where: {
              companyId: companyId,
            },
          }),
          dbClient.gameResult.count({
            where: {
              companyId: companyId,
            },
          }),
        ],
      );

      return {
        clientId: companyId,
        clientName: activityCompanyMap.get(companyId) || "Unknown",
        totalActivity,
        totalCards: cardCount,
        totalDebriefs: debriefCount,
        totalNewUsers: userCount,
        totalGameSubmissions: gameCount,
      };
    },
  );

  // Wait for all promises to resolve
  const topClientsByActivity = (await Promise.all(topClientsPromises))
    .sort((a, b) => b.totalActivity - a.totalActivity)
    .slice(0, 10);

  // ---- 5. Platform Usage Trend ----
  const platformUsageTrend = await Promise.all(
    trendDates.map(async (dateStr) => {
      const dateStart = new Date(dateStr + "T00:00:00.000Z");
      const dateEnd = new Date(dateStr + "T23:59:59.999Z");

      const [totalCards, totalDebriefs, totalNewUsers, totalGameSubmissions] =
        await Promise.all([
          dbClient.cardSubmission.count({
            where: { submitDay: dateStr, status: "ACTIVE" },
          }),
          dbClient.dailyDebrief.count({
            where: { submitDay: dateStr, status: "ACTIVE" },
          }),
          dbClient.user.count({
            where: {
              createdAt: { gte: dateStart, lte: dateEnd },
            },
          }),
          dbClient.gameResult.count({
            where: {
              createdAt: { gte: dateStart, lte: dateEnd },
            },
          }),
        ]);

      const used =
        totalCards + totalDebriefs + totalNewUsers + totalGameSubmissions;

      return {
        date: dateStr,
        used,
        totalCards,
        totalDebriefs,
        totalNewUsers,
        totalGameSubmissions,
      };
    }),
  );

  // ---- 6. Subscription Buy Trend ----
  const subscribtionBuyTrend = await Promise.all(
    trendDates.map(async (dateStr) => {
      const dateStart = new Date(dateStr + "T00:00:00.000Z");
      const dateEnd = new Date(dateStr + "T23:59:59.999Z");

      const result = await dbClient.subscriptions.aggregate({
        where: {
          createdAt: { gte: dateStart, lte: dateEnd },
        },
        _sum: { price: true },
      });

      const money = result._sum.price || 0;
      return { date: dateStr, money };
    }),
  );

  // ---- 7. Return ----
  return {
    cardByCompany,
    topClientsByActivity,
    platformUsageTrend,
    subscribtionBuyTrend,
  };
};

// Helper: generate array of date strings (YYYY-MM-DD) from start to end inclusive
function getDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  let current = new Date(start + "T00:00:00.000Z");
  const endDate = new Date(end + "T00:00:00.000Z");
  while (current <= endDate) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// get client dashboard overview
export const getClientDashboardOverviewService = async (
  companyId: any,
  rigId?: any,
  startDate?: any,
  endDate?: any,
) => {
  const baseWhere: any = {
    companyId,
  };

  if (rigId) {
    baseWhere.rigId = rigId;
  }

  const todayDateStr = new Date().toLocaleDateString("en-CA"); // "2026-06-13"

  // For totalCards, openCards, closedCards, urgentActionRequired - use submitDay filter
  const submitDayWhere: any = { ...baseWhere };

  if (startDate && endDate) {
    submitDayWhere.submitDay = {
      gte: startDate,
      lte: endDate,
    };
  } else {
    submitDayWhere.submitDay = todayDateStr;
  }

  // For chart data - same as submitDayWhere
  const chartWhere: any = { ...baseWhere };

  if (startDate && endDate) {
    chartWhere.submitDay = {
      gte: startDate,
      lte: endDate,
    };
  } else {
    chartWhere.submitDay = todayDateStr;
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
    // Total Cards - using submitDay filter (same as getCompanyAnalysisService)
    dbClient.cardSubmission.count({
      where: submitDayWhere,
    }),

    // Total Open Cards - using submitDay filter
    dbClient.cardSubmission.count({
      where: {
        ...submitDayWhere,
        isOpened: true,
      },
    }),

    // Total Closed Cards - using submitDay filter
    dbClient.cardSubmission.count({
      where: {
        ...submitDayWhere,
        isOpened: false,
      },
    }),

    // Urgent Action Required (HIGH risk) - using submitDay filter
    dbClient.cardSubmission.count({
      where: {
        ...submitDayWhere,
        riskSeverity: "HIGH",
      },
    }),

    // Today's Submitting Cards - using createdAt for today's submissions
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

    // Total Users
    dbClient.user.count({
      where: userWhere,
    }),

    // Chart Data - grouped by submitDay
    dbClient.cardSubmission.groupBy({
      by: ["submitDay"],
      where: chartWhere,
      _count: {
        id: true,
      },
      orderBy: {
        submitDay: "asc",
      },
    }),

    // Card Type Distribution - using submitDay filter
    dbClient.cardSubmission.groupBy({
      by: ["cardTypeId"],
      where: submitDayWhere,
      _count: {
        id: true,
      },
    }),

    // Recent Cards - using userWhere (no date filter for recent cards)
    dbClient.cardSubmission.findMany({
      where: userWhere,
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

  let cardsByCardTypeWithPercentage: any[] = [];

  if (cardTypeIds.length > 0) {
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

    cardsByCardTypeWithPercentage = cardsByCardType.map((item) => {
      const cardType = cardTypes.find((ct) => ct.id === item.cardTypeId);
      return {
        cardTypeId: item.cardTypeId,
        cardTypeName: cardType?.name || "Unknown",
        total: item._count.id,
        percentage: Number(
          ((item._count.id / totalCardCount) * 100).toFixed(2),
        ),
      };
    });
  } else {
    cardsByCardTypeWithPercentage = [];
  }

  // ====================================
  // Chart Response Format
  // ====================================
  const chartData = cardSubmissionChartsData.map((item) => ({
    date: item.submitDay,
    total: item._count.id,
  }));

  if (process.env.NODE_ENV === "development") {
    console.log("=== Client Dashboard Debug ===");
    console.log("startDate:", startDate);
    console.log("endDate:", endDate);
    console.log("submitDayWhere:", JSON.stringify(submitDayWhere, null, 2));
    console.log("totalCards:", totalCards);
    console.log("chartData length:", chartData.length);
    console.log("================================");
  }

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
  const baseWhere: any = {
    companyId,
  };

  if (rigId) {
    baseWhere.rigId = rigId;
  }

  const todayDateStr = new Date().toLocaleDateString("en-CA"); // "2026-06-13"

  let chartAndFilterWhere: any = { ...baseWhere };

  if (startDate && endDate) {
    chartAndFilterWhere.submitDay = {
      gte: startDate,
      lte: endDate,
    };
  } else {
    chartAndFilterWhere.submitDay = todayDateStr;
  }

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
      where: baseWhere,
    }),

    dbClient.cardSubmission.count({
      where: {
        ...baseWhere,
        isOpened: true,
      },
    }),

    dbClient.cardSubmission.count({
      where: {
        ...baseWhere,
        isOpened: false,
      },
    }),

    dbClient.cardSubmission.count({
      where: {
        ...baseWhere,
        riskSeverity: "HIGH",
      },
    }),

    dbClient.cardSubmission.count({
      where: {
        companyId,
        ...(rigId && { rigId }),
        submitDay: todayDateStr,
      },
    }),

    dbClient.user.count({
      where: userWhere,
    }),

    dbClient.cardSubmission.groupBy({
      by: ["submitDay"],
      where: chartAndFilterWhere,
      _count: {
        id: true,
      },
      orderBy: {
        submitDay: "asc",
      },
    }),

    // Area Wise Cards
    dbClient.cardSubmission.groupBy({
      by: ["areaId"],
      where: chartAndFilterWhere,
      _count: {
        id: true,
      },
    }),

    // Hazard Wise Cards
    dbClient.cardSubmission.groupBy({
      by: ["hazardId"],
      where: chartAndFilterWhere,
      _count: {
        id: true,
      },
    }),
  ]);

  // Area Wise Data Formatting
  const areaIds = areaWiseCards.map((item) => item.areaId).filter(Boolean);

  let areaWiseCardsWithDetails: any[] = [];

  if (areaIds.length > 0) {
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

    areaWiseCardsWithDetails = areaWiseCards.map((item) => {
      const area = areas.find((a) => a.id === item.areaId);
      return {
        areaId: item.areaId,
        areaName: area?.name || "Unknown",
        areaColor: area?.color || null,
        total: item._count.id,
      };
    });
  }

  // Hazard Wise Data Formatting
  const hazardIds = hazardWiseCards
    .map((item) => item.hazardId)
    .filter(Boolean);

  let hazardWiseCardsWithDetails: any[] = [];

  if (hazardIds.length > 0) {
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

    hazardWiseCardsWithDetails = hazardWiseCards.map((item) => {
      const hazard = hazards.find((h) => h.id === item.hazardId);
      return {
        hazardId: item.hazardId,
        hazardName: hazard?.name || "Unknown",
        total: item._count.id,
      };
    });
  }

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

// export dashboard report
export const exportDashboardReportService = async (payload: any) => {
  return "export dashboard report";
};

// export company overall analysis report
export const exportCompanyOverallAnalysisReportService = async (
  payload: any,
) => {
  return "export company overall analysis report";
};
