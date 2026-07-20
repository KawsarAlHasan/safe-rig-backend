import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { z } from "zod"; // optional but recommended
import { dbClient } from "../../../lib/prisma";
import safetyApiService from "../../../services/safeai.service";
import { Prisma } from "../../../../generated/prisma/client";

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

// Helper to add days to a date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper to fetch period data (hazards & areas) for a given date range and filter
const getPeriodData = async (
  startDateStr: string,
  endDateStr: string,
  filter: { companyId?: number; rigId?: number },
): Promise<{
  hazards: {
    hazard_name: string;
    high_count: number;
    medium_count: number;
    low_count: number;
  }[];
  areas: { area_name: string; count: number }[];
}> => {
  // Build where clause for the date range and company/rig filter
  const whereClause: Prisma.CardSubmissionWhereInput = {
    submitDay: {
      gte: startDateStr,
      lte: endDateStr,
    },
    hazardId: { not: null },
    areaId: { not: null },
  };

  if (filter.rigId) {
    whereClause.rigId = filter.rigId;
  } else if (filter.companyId) {
    whereClause.companyId = filter.companyId;
  }

  // 1. Get hazard & severity counts
  const hazardSeverityCounts = await dbClient.cardSubmission.groupBy({
    by: ["hazardId", "riskSeverity"],
    where: whereClause,
    _count: {
      id: true,
    },
  });

  // 2. Get area counts
  const areaCounts = await dbClient.cardSubmission.groupBy({
    by: ["areaId"],
    where: whereClause,
    _count: {
      id: true,
    },
  });

  // Process hazard data
  // Aggregate totals per hazard and severity breakdown
  const hazardMap = new Map<
    number,
    { total: number; high: number; medium: number; low: number }
  >();

  for (const item of hazardSeverityCounts) {
    const hazardId = item.hazardId!;
    const severity = item.riskSeverity;
    const count = item._count.id;

    if (!hazardMap.has(hazardId)) {
      hazardMap.set(hazardId, { total: 0, high: 0, medium: 0, low: 0 });
    }
    const entry = hazardMap.get(hazardId)!;
    entry.total += count;
    if (severity === "HIGH") entry.high += count;
    else if (severity === "MEDIUM") entry.medium += count;
    else if (severity === "LOW") entry.low += count;
  }

  // Sort hazards by total count descending, take top 30
  const sortedHazards = Array.from(hazardMap.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 30);

  // Fetch hazard names for the selected IDs
  const hazardIds = sortedHazards.map(([id]) => id);
  const hazardNamesMap = new Map<number, string>();
  if (hazardIds.length > 0) {
    const hazards = await dbClient.hazard.findMany({
      where: { id: { in: hazardIds } },
      select: { id: true, name: true },
    });
    for (const h of hazards) {
      hazardNamesMap.set(h.id, h.name);
    }
  }

  // Build hazards array
  const hazardsResult = sortedHazards.map(([hazardId, counts]) => ({
    hazard_name: hazardNamesMap.get(hazardId) || `Hazard #${hazardId}`,
    high_count: counts.high,
    medium_count: counts.medium,
    low_count: counts.low,
  }));

  // Process area data
  // Get area names
  const areaIds = areaCounts.map((item) => item.areaId!).filter(Boolean);
  const areaNamesMap = new Map<number, string>();
  if (areaIds.length > 0) {
    const areas = await dbClient.area.findMany({
      where: { id: { in: areaIds } },
      select: { id: true, name: true },
    });
    for (const a of areas) {
      areaNamesMap.set(a.id, a.name);
    }
  }

  const areasResult = areaCounts.map((item) => ({
    area_name: areaNamesMap.get(item.areaId!) || `Area #${item.areaId}`,
    count: item._count.id,
  }));

  return {
    hazards: hazardsResult,
    areas: areasResult,
  };
};

// Main service function
export const getAIHazardAnalysisService = async (payload: any) => {
  const { companyId, rigId, startDate, endDate } = payload;

  // Parse dates
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate total days (inclusive)
  const totalDays =
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const halfDays = Math.floor(totalDays / 2);

  // Determine previous and current periods
  const previousStart = start;
  const previousEnd = addDays(start, halfDays - 1);
  const currentStart = addDays(start, halfDays);
  const currentEnd = end;

  // Convert to strings for query
  const prevStartStr = formatDate(previousStart);
  const prevEndStr = formatDate(previousEnd);
  const currStartStr = formatDate(currentStart);
  const currEndStr = formatDate(currentEnd);

  // Build filter
  const filter = rigId ? { rigId } : { companyId };

  // Fetch data for both periods concurrently
  const [previous_period, current_period] = await Promise.all([
    getPeriodData(prevStartStr, prevEndStr, filter),
    getPeriodData(currStartStr, currEndStr, filter),
  ]);

  // Call external AI service
  const result = await safetyApiService.getWhatChanged({
    previous_period,
    current_period,
  });

  return result;
};

// get company ai hazard analysis
export const getCompanyAIHazardAnalysisService = async (payload: any) => {
  const { companyId, rigId, startDate, endDate } = payload;

  // demo date: startDate: "2023-08-01", endDate: "2023-08-31"

  // CardSubmission আর DailyDebrief এর submitDay দিয়ে সার্চ করবে

  // আগে চেক দিবে rigId আছে কিনা? যদি rigId থাকে তাহলে সেই rigId দিয়ে DailyDebrief এবং CardSubmission এর rigId দিয়ে সার্চ করবে । 
  // যদি rigId থাকে না তাহলে সেই companyId দিয়ে DailyDebrief এবং CardSubmission এর companyId দিয়ে সার্চ করবে

  // 1. Generate Suggestions: top 3 hazards যাদের id দিয়ে সব চেয়ে বেশি card submission হয়েছে তাদের নাম
  // {
  //   "hazards": [
  //     "missing_tagline",
  //     "no_chain_strap"
  //   ]
  // }

  // 2. Debrief Summary: maximum 20 answers per question randomly এটা আনতে হবে DailyDebrief থেকে
  // {
  //   "responses": [
  //     {
  //       "question": "What happened during today's shift?",
  //       "answers": [
  //         "Drilling operations were delayed for 30 minutes due to a hydraulic pressure drop.",
  //         "A minor oil leak was detected and contained quickly.",
  //         "Weather conditions caused slight delays in material transfer."
  //       ]
  //     },
  //     {
  //       "question": "What worked well today?",
  //       "answers": [
  //         "Communication between team members was smooth.",
  //         "Safety protocols were followed properly.",
  //         "Technical team response minimized downtime."
  //       ]
  //     },
  //     {
  //       "question": "What could be improved?",
  //       "answers": [
  //         "Preventive maintenance on pumps should be increased.",
  //         "Tool availability needs improvement.",
  //         "Shift handovers require better coordination."
  //       ]
  //     }
  //   ]
  // }

  // 3. Root Cause Clustering: high severity দিয়ে যাদের(hazard) সবচেয়ে বেশি কার্ড সাবমিট হয়েছে তাদের মধ্যে থেকে top 3 hazard বের করতে হবে
  // Top 3 hazard in high severity
  // Top 3 areas
  // Maximum 10 descriptions for each area randomly
  //   {
  //   "hazards": [
  //     {
  //       "hazard_name": "Slip Hazard",
  //       "areas": [
  //         {
  //           "area_name": "Drilling Floor",
  //           "descriptions": [
  //             "Hydraulic oil leaking from the main pump created a slippery surface.",
  //             "Oil spill remained on the floor after maintenance work.",
  //             "Workers reported slippery conditions near the drilling equipment.",
  //             "Small hydraulic leak observed around the pump connection."
  //           ]
  //         },
  //         {
  //           "area_name": "Pump Room",
  //           "descriptions": [
  //             "Oil leakage found near the pressure valve.",
  //             "Lubricant spilled beside the hydraulic pump.",
  //             "Maintenance team observed oil residue on the floor.",
  //             "Minor leak detected from a hydraulic hose."
  //           ]
  //         },
  //         {
  //           "area_name": "Loading Bay",
  //           "descriptions": [
  //             "Grease mixed with rainwater created a slippery walkway.",
  //             "Forklift left oil drips on the floor.",
  //             "Spilled lubricant was found near the loading ramp.",
  //             "Floor remained wet after equipment cleaning."
  //           ]
  //         }
  //       ]
  //     },
  //     {
  //       "hazard_name": "Housekeeping",
  //       "areas": [
  //         {
  //           "area_name": "Workshop",
  //           "descriptions": [
  //             "Tools were left on the floor after maintenance.",
  //             "Extension cables blocked the main walkway.",
  //             "Waste materials were not disposed of properly.",
  //             "Cleaning was not completed after the shift."
  //           ]
  //         },
  //         {
  //           "area_name": "Storage Area",
  //           "descriptions": [
  //             "Boxes were stacked in front of an emergency exit.",
  //             "Pallets were stored outside the designated area.",
  //             "Loose packaging materials were scattered on the floor.",
  //             "Materials blocked access to equipment."
  //           ]
  //         },
  //         {
  //           "area_name": "Warehouse",
  //           "descriptions": [
  //             "Unused equipment was stored in the walkway.",
  //             "Scrap materials accumulated near storage racks.",
  //             "Housekeeping inspections were missed.",
  //             "Cleaning schedule was not followed consistently."
  //           ]
  //         }
  //       ]
  //     },
  //     {
  //       "hazard_name": "PPE",
  //       "areas": [
  //         {
  //           "area_name": "Rig Floor",
  //           "descriptions": [
  //             "Worker entered the area without safety glasses.",
  //             "Helmet strap was not fastened correctly.",
  //             "Protective gloves were removed during maintenance.",
  //             "Face shield was not used while grinding."
  //           ]
  //         },
  //         {
  //           "area_name": "Workshop",
  //           "descriptions": [
  //             "Hearing protection was not worn.",
  //             "Safety shoes did not meet site requirements.",
  //             "Eye protection was missing during cutting work.",
  //             "Worker ignored PPE requirements while operating machinery."
  //           ]
  //         },
  //         {
  //           "area_name": "Loading Bay",
  //           "descriptions": [
  //             "Reflective vest was not worn.",
  //             "Worker entered without a safety helmet.",
  //             "Safety goggles were missing during loading operations.",
  //             "High-visibility clothing was not used."
  //           ]
  //         }
  //       ]
  //     }
  //   ]
  // }

  // 4. Positive Trend Analysis: Send all hazard where previous_count > current_count
  // startDate আর endDate এর মধ্যে সময় যত দিন আছে সেটা হলো current আর startDate আর endDate এর মধ্যে সময় যত দিন আছে ঠিক ততদিন আগে তত সময় হলো previous অর্থাৎ
  // startDate: 2026-05-01 আর endDate: 2026-05-30 হয় তাহলে previous হবে 2026-04-01 আর 2026-04-30 এর মধ্যে সময় যত দিন আছে সেটা।
  // এখানে current এ যত গুলো কার্ড সাবমিট হয়েছে সেটার কাউন্ট করা current_count একই ভাবে previous_count
  // {
  //   "hazards": [
  //     {
  //       "hazard_name": "Slip Hazard",
  //       "previous_count": 28,
  //       "current_count": 18
  //     },
  //     {
  //       "hazard_name": "Housekeeping",
  //       "previous_count": 35,
  //       "current_count": 22
  //     },
  //     {
  //       "hazard_name": "Manual Handling",
  //       "previous_count": 20,
  //       "current_count": 14
  //     },
  //     {
  //       "hazard_name": "Working at Height",
  //       "previous_count": 15,
  //       "current_count": 12
  //     },
  //     {
  //       "hazard_name": "Dropped Objects",
  //       "previous_count": 18,
  //       "current_count": 11
  //     }
  //   ]
  // }

  // 5. What-Changed Analysis:
  // startDate আর endDate এর মধ্যে সময় যত দিন আছে সেটা হলো current আর startDate আর endDate এর মধ্যে সময় যত দিন আছে ঠিক ততদিন আগে তত সময় হলো previous অর্থাৎ
  // startDate: 2026-05-01 আর endDate: 2026-05-30 হয় তাহলে previous হবে 2026-04-01 আর 2026-04-30 এর মধ্যে সময় যত দিন আছে সেটা।
  // Top 10 hazard যাদের id দিয়ে কার্ড সাবমিট হয়েছে সেই গুলো বের করে তাদের high_count, medium_count, low_count কাউন্ট করা current_period একই ভাবে previous_period
  // Top 10 hazard যাদের id দিয়ে কার্ড সাবমিট হয়েছে সেই গুলো বের করে তাদের মধ্যে যে area গুলো আছে সেই area এর কাউন্ট করা current_period একই ভাবে previous_period
  //   {
  //   "previous_period": {
  //     "hazards": [
  //       {
  //         "hazard_name": "Slip Hazard",
  //         "high_count": 12,
  //         "medium_count": 20,
  //         "low_count": 8
  //       },
  //       {
  //         "hazard_name": "Housekeeping",
  //         "high_count": 6,
  //         "medium_count": 18,
  //         "low_count": 22
  //       }
  //     ],
  //     "areas": [
  //       {
  //         "area_name": "Drilling Floor",
  //         "count": 34
  //       },
  //       {
  //         "area_name": "Pump Room",
  //         "count": 19
  //       }
  //     ]
  //   },
  //   "current_period": {
  //     "hazards": [
  //       {
  //         "hazard_name": "Slip Hazard",
  //         "high_count": 20,
  //         "medium_count": 16,
  //         "low_count": 10
  //       },
  //       {
  //         "hazard_name": "Housekeeping",
  //         "high_count": 4,
  //         "medium_count": 15,
  //         "low_count": 20
  //       }
  //     ],
  //     "areas": [
  //       {
  //         "area_name": "Drilling Floor",
  //         "count": 22
  //       },
  //       {
  //         "area_name": "Pump Room",
  //         "count": 26
  //       }
  //     ]
  //   }
  // }
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
