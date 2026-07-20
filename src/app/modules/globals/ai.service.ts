import dayjs from "dayjs";
import { dbClient } from "../../../lib/prisma";
import { Prisma } from "../../../../generated/prisma/client";
import safetyApiService from "../../../services/safeai.service";

interface AnalysisPayload {
  companyId: number;
  rigId?: number;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
}

interface HazardCount {
  hazard_name: string;
  previous_count: number;
  current_count: number;
}

interface DebriefResponse {
  question: string;
  answers: string[];
}

interface RootCauseHazard {
  hazard_name: string;
  areas: RootCauseArea[];
}

interface RootCauseArea {
  area_name: string;
  descriptions: string[];
}

interface WhatChangedPeriod {
  hazards: {
    hazard_name: string;
    high_count: number;
    medium_count: number;
    low_count: number;
  }[];
  areas: {
    area_name: string;
    count: number;
  }[];
}

interface AnalysisResult {
  suggestions: any;
  debriefSummary: any;
  rootCauseClustering: any;
  positiveTrend: any;
  whatChanged: any;
}
// interface AnalysisResult {
//   suggestions: { hazards: string[] };
//   debriefSummary: DebriefResponse[];
//   rootCauseClustering: RootCauseHazard[];
//   positiveTrend: HazardCount[];
//   whatChanged: {
//     previous_period: WhatChangedPeriod;
//     current_period: WhatChangedPeriod;
//   };
// }

// Helper: get filter condition for company or rig
const getFilter = (payload: AnalysisPayload) => {
  const { companyId, rigId } = payload;
  if (rigId) return { rigId };
  return { companyId };
};

// Helper: shuffle array and take first n
const takeRandom = <T>(arr: T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

// Helper: compute previous period dates
const getPreviousPeriod = (startDate: string, endDate: string) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const diffDays = end.diff(start, "day") + 1; // inclusive count
  const prevStart = start.subtract(diffDays, "day").format("YYYY-MM-DD");
  const prevEnd = end.subtract(diffDays, "day").format("YYYY-MM-DD");
  return { prevStart, prevEnd };
};

export const getCompanyAIHazardAnalysisService = async (
  payload: any, // AnalysisPayload,
): Promise<AnalysisResult> => {
  const { companyId, rigId, startDate, endDate } = payload;
  const filter = getFilter(payload);
  const { prevStart, prevEnd } = getPreviousPeriod(startDate, endDate);

  // ---------- 1. Generate Suggestions: top 3 hazards by total submissions ----------
  const topHazardsGroup = await dbClient.cardSubmission.groupBy({
    by: ["hazardId"],
    where: {
      submitDay: { gte: startDate, lte: endDate },
      ...filter,
      hazardId: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 3,
  });

  const hazardIds = topHazardsGroup.map((g) => g.hazardId!).filter(Boolean);
  const hazards = await dbClient.hazard.findMany({
    where: { id: { in: hazardIds } },
    select: { id: true, name: true },
  });
  const hazardNameMap = Object.fromEntries(hazards.map((h) => [h.id, h.name]));
  const suggestions = {
    hazards: topHazardsGroup.map(
      (g) => hazardNameMap[g.hazardId!] || "Unknown",
    ),
  };

  // ---------- 2. Debrief Summary: collect answers per question (max 20 randomly) ----------
  const dailyDebriefs = await dbClient.dailyDebrief.findMany({
    where: {
      submitDay: { gte: startDate, lte: endDate },
      ...filter,
      questionAnswer: { not: Prisma.AnyNull },
    },
    select: { questionAnswer: true },
  });

  const questionMap: Record<string, string[]> = {};
  for (const record of dailyDebriefs) {
    const qa = record.questionAnswer as any[];
    if (!Array.isArray(qa)) continue;
    for (const item of qa) {
      const question = item.question?.trim();
      const answer = item.answer?.trim();
      if (!question || !answer) continue;
      if (!questionMap[question]) questionMap[question] = [];
      questionMap[question].push(answer);
    }
  }

  const debriefSummary: DebriefResponse[] = Object.entries(questionMap).map(
    ([question, answers]) => ({
      question,
      answers: takeRandom(answers, 20),
    }),
  );

  // ---------- 3. Root Cause Clustering: top 3 hazards by HIGH severity ----------
  const highSeverityHazardsGroup = await dbClient.cardSubmission.groupBy({
    by: ["hazardId"],
    where: {
      submitDay: { gte: startDate, lte: endDate },
      ...filter,
      hazardId: { not: null },
      riskSeverity: "HIGH",
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 3,
  });

  const rootHazardIds = highSeverityHazardsGroup
    .map((g) => g.hazardId!)
    .filter(Boolean);

  let rootCauseClustering: RootCauseHazard[] = [];

  if (rootHazardIds.length > 0) {
    // Fetch all submissions for these hazards (any severity) to gather areas and descriptions
    const submissions = await dbClient.cardSubmission.findMany({
      where: {
        submitDay: { gte: startDate, lte: endDate },
        ...filter,
        hazardId: { in: rootHazardIds },
      },
      include: {
        hazard: true,
        area: true,
      },
    });

    // Group by hazardId -> areaId -> descriptions
    const hazardMap: Record<
      number,
      {
        hazardName: string;
        areas: Record<number, { areaName: string; descriptions: string[] }>;
      }
    > = {};

    for (const sub of submissions) {
      if (!sub.hazardId || !sub.areaId) continue;
      if (!hazardMap[sub.hazardId]) {
        hazardMap[sub.hazardId] = {
          hazardName: sub.hazard?.name || "Unknown",
          areas: {},
        };
      }
      const hazard = hazardMap[sub.hazardId];
      if (!hazard.areas[sub.areaId]) {
        hazard.areas[sub.areaId] = {
          areaName: sub.area?.name || "Unknown",
          descriptions: [],
        };
      }
      if (sub.description) {
        hazard.areas[sub.areaId].descriptions.push(sub.description);
      }
    }

    // For each hazard, pick top 3 areas by description count, then take 10 random descriptions
    for (const [hazardId, data] of Object.entries(hazardMap)) {
      const areaEntries = Object.entries(data.areas);
      // Sort areas by number of descriptions descending
      areaEntries.sort(
        (a, b) => b[1].descriptions.length - a[1].descriptions.length,
      );
      const topAreas = areaEntries.slice(0, 3).map(([_, areaData]) => ({
        area_name: areaData.areaName,
        descriptions: takeRandom(areaData.descriptions, 10),
      }));
      rootCauseClustering.push({
        hazard_name: data.hazardName,
        areas: topAreas,
      });
    }
  }

  // ---------- 4. Positive Trend Analysis (Improved) ----------
  // Get distinct hazard IDs from both periods
  const currentHazardIds = await dbClient.cardSubmission.findMany({
    where: {
      submitDay: { gte: startDate, lte: endDate },
      ...filter,
      hazardId: { not: null },
    },
    distinct: ["hazardId"],
    select: { hazardId: true },
  });
  const prevHazardIds = await dbClient.cardSubmission.findMany({
    where: {
      submitDay: { gte: prevStart, lte: prevEnd },
      ...filter,
      hazardId: { not: null },
    },
    distinct: ["hazardId"],
    select: { hazardId: true },
  });
  const allHazardIdSet = new Set([
    ...currentHazardIds.map((h) => h.hazardId!),
    ...prevHazardIds.map((h) => h.hazardId!),
  ]);
  const allHazardIds = Array.from(allHazardIdSet);

  // Get current counts per hazard
  const currentCounts = await dbClient.cardSubmission.groupBy({
    by: ["hazardId"],
    where: {
      submitDay: { gte: startDate, lte: endDate },
      ...filter,
      hazardId: { in: allHazardIds },
    },
    _count: { id: true },
  });
  const prevCounts = await dbClient.cardSubmission.groupBy({
    by: ["hazardId"],
    where: {
      submitDay: { gte: prevStart, lte: prevEnd },
      ...filter,
      hazardId: { in: allHazardIds },
    },
    _count: { id: true },
  });

  const currentMap = Object.fromEntries(
    currentCounts.map((c) => [c.hazardId!, c._count.id]),
  );
  const prevMap = Object.fromEntries(
    prevCounts.map((c) => [c.hazardId!, c._count.id]),
  );

  // Fetch hazard names for all IDs
  const allHazards = await dbClient.hazard.findMany({
    where: { id: { in: allHazardIds } },
    select: { id: true, name: true },
  });
  const hazardNameMapAll = Object.fromEntries(
    allHazards.map((h) => [h.id, h.name]),
  );

  // ===== CHANGE START =====
  const positiveTrend: HazardCount[] = [];
  const minDecrease = 0;

  for (const id of allHazardIds) {
    const current = currentMap[id] || 0;
    const previous = prevMap[id] || 0;
    if (previous > current && previous - current > minDecrease) {
      positiveTrend.push({
        hazard_name: hazardNameMapAll[id] || "Unknown",
        previous_count: previous,
        current_count: current,
      });
    }
  }

  positiveTrend.sort(
    (a, b) =>
      b.previous_count - b.current_count - (a.previous_count - a.current_count),
  );
  // ===== CHANGE END =====

  // ---------- 5. What-Changed Analysis: top 10 hazards by current submissions, then severity & area counts ----------
  const top10HazardsGroup = await dbClient.cardSubmission.groupBy({
    by: ["hazardId"],
    where: {
      submitDay: { gte: startDate, lte: endDate },
      ...filter,
      hazardId: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });
  const top10HazardIds = top10HazardsGroup
    .map((g) => g.hazardId!)
    .filter(Boolean);

  // Helper: get severity counts for a given period and hazard ids
  const getSeverityCounts = async (
    start: string,
    end: string,
    hazardIds: number[],
  ) => {
    const groups = await dbClient.cardSubmission.groupBy({
      by: ["hazardId", "riskSeverity"],
      where: {
        submitDay: { gte: start, lte: end },
        ...filter,
        hazardId: { in: hazardIds },
      },
      _count: { id: true },
    });
    const result: Record<
      number,
      { HIGH: number; MEDIUM: number; LOW: number }
    > = {};
    for (const g of groups) {
      if (!g.hazardId) continue;
      if (!result[g.hazardId]) {
        result[g.hazardId] = { HIGH: 0, MEDIUM: 0, LOW: 0 };
      }
      result[g.hazardId][g.riskSeverity] = g._count.id;
    }
    return result;
  };

  // Helper: get area counts for a given period and hazard ids
  const getAreaCounts = async (
    start: string,
    end: string,
    hazardIds: number[],
  ) => {
    const groups = await dbClient.cardSubmission.groupBy({
      by: ["areaId"],
      where: {
        submitDay: { gte: start, lte: end },
        ...filter,
        hazardId: { in: hazardIds },
        areaId: { not: null },
      },
      _count: { id: true },
    });
    const areaIds = groups.map((g) => g.areaId!).filter(Boolean);
    const areas = await dbClient.area.findMany({
      where: { id: { in: areaIds } },
      select: { id: true, name: true },
    });
    const areaNameMap = Object.fromEntries(areas.map((a) => [a.id, a.name]));
    return groups.map((g) => ({
      area_name: areaNameMap[g.areaId!] || "Unknown",
      count: g._count.id,
    }));
  };

  const currentSeverity = await getSeverityCounts(
    startDate,
    endDate,
    top10HazardIds,
  );
  const prevSeverity = await getSeverityCounts(
    prevStart,
    prevEnd,
    top10HazardIds,
  );

  // Build hazards list for what-changed
  const hazardNamesForTop10 = await dbClient.hazard.findMany({
    where: { id: { in: top10HazardIds } },
    select: { id: true, name: true },
  });
  const nameMapTop10 = Object.fromEntries(
    hazardNamesForTop10.map((h) => [h.id, h.name]),
  );

  const currentHazards = top10HazardIds.map((id) => ({
    hazard_name: nameMapTop10[id] || "Unknown",
    high_count: currentSeverity[id]?.HIGH || 0,
    medium_count: currentSeverity[id]?.MEDIUM || 0,
    low_count: currentSeverity[id]?.LOW || 0,
  }));
  const prevHazards = top10HazardIds.map((id) => ({
    hazard_name: nameMapTop10[id] || "Unknown",
    high_count: prevSeverity[id]?.HIGH || 0,
    medium_count: prevSeverity[id]?.MEDIUM || 0,
    low_count: prevSeverity[id]?.LOW || 0,
  }));

  const currentAreas = await getAreaCounts(startDate, endDate, top10HazardIds);
  const prevAreas = await getAreaCounts(prevStart, prevEnd, top10HazardIds);

  const whatChanged = {
    previous_period: {
      hazards: prevHazards,
      areas: prevAreas,
    },
    current_period: {
      hazards: currentHazards,
      areas: currentAreas,
    },
  };

  // Call external suggestions service
  const suggestionsFromAi = await safetyApiService.getSuggestions(suggestions);

  // Call external debriefSummary service
  const debriefSummaryFromAi = await safetyApiService.getSummary({
    responses: debriefSummary,
  });

  // Call external rootCauseClustering service
  const rootCauseClusteringFromAi = await safetyApiService.getRootCauses({
    hazards: rootCauseClustering,
  });

  const positiveTrendDemo = [
    {
      hazard_name: "Slip Hazard",
      previous_count: 28,
      current_count: 18,
    },
    {
      hazard_name: "Housekeeping",
      previous_count: 35,
      current_count: 22,
    },
    {
      hazard_name: "Manual Handling",
      previous_count: 20,
      current_count: 14,
    },
    {
      hazard_name: "Working at Height",
      previous_count: 15,
      current_count: 12,
    },
    {
      hazard_name: "Dropped Objects",
      previous_count: 18,
      current_count: 11,
    },
  ];

  // Call external positiveTrend service
  const positiveTrendFromAi = await safetyApiService.getPositiveTrends({
    hazards: positiveTrendDemo, // positiveTrend,
  });

  // Call external whatChanged service
  const whatChangedFromAi = await safetyApiService.getWhatChanged(whatChanged);

  const results = {
    suggestions: suggestionsFromAi,
    debriefSummary: debriefSummaryFromAi,
    rootCauseClustering: rootCauseClusteringFromAi,
    positiveTrend: positiveTrendFromAi,
    whatChanged: whatChangedFromAi,
  };

  // Return final result
  return results;
};
