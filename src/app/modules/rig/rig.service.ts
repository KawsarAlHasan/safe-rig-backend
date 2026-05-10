import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../../generated/prisma/client";
import ApiError from "../../../errors/ApiError";
import { dbClient } from "../../../lib/prisma";

// create new rig
export const rigCreateService = async (payload: any, companyId: any) => {
  const { name, location, latitude, longitude, rigTypeId } = payload;

  // check rig  name
  const isExistName = await dbClient.rig.findFirst({
    where: { name: name, companyId: companyId },
  });

  // check role name
  if (isExistName) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Rig already exists!");
  }

  // create new rig  on prisma dbClient
  const result = await dbClient.rig.create({
    data: {
      name: name,
      location: location,
      latitude: latitude,
      longitude: longitude,
      companyId: companyId,
      rigTypeId: rigTypeId,
    },
  });

  // check role creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create rig!");
  }

  console.log(result, "result");

  return result;
};

// get rig
export const getRigService = async (query: any, companyId: any) => {
  const andConditions: Prisma.RigWhereInput[] = [];

  // Search by name
  if (query.search) {
    andConditions.push({
      name: {
        contains: query.search,
        mode: "insensitive",
      },
    });
  }

  // Status filter
  if (!query.status) {
    andConditions.push({
      status: "ACTIVE",
    });
  } else if (query.status === "all") {
    andConditions.push({
      NOT: {
        status: "DELETED",
      },
    });
  } else {
    andConditions.push({
      status: query.status,
    });
  }

  if (companyId) {
    andConditions.push({
      companyId: Number(companyId),
    });
  } else if (query.companyId) {
    andConditions.push({
      companyId: Number(query.companyId),
    });
  }

  const whereCondition: Prisma.RigWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await dbClient.rig.findMany({
    where: whereCondition,
    include: {
      _count: {
        select: {
          users: true, // Total Users
          cardSubmissions: true, // Total Card Submissions
        },
      },
      cardSubmissions: {
        where: {
          isOpened: true,
        },
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to fetch rig!");
  }

  if (result.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No rig found!");
  }

  const formattedResult = result.map((rig: any) => ({
    ...rig,
    totalUsers: rig?._count?.users,
    totalCardSubmissions: rig?._count?.cardSubmissions,
    totalOpenedCards: rig?.cardSubmissions?.length,
  }));

  return formattedResult;
};

// Update an existing Rig
export const updateRigService = async (payload: any, companyId: any) => {
  const { id, name, location, latitude, longitude, rigTypeId, status } =
    payload;

  // check rig  exist
  const isExistRig = await dbClient.rig.findUnique({
    where: { id: id },
  });

  if (!isExistRig) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Rig doesn't exist!");
  }

  // check duplicate name
  if (name && name !== isExistRig.name) {
    const isDuplicateName = await dbClient.rig.findFirst({
      where: { companyId: companyId, name: name },
    });

    if (isDuplicateName) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Rig with name ${name} already exists!`,
      );
    }
  }

  // update rig
  const result = await dbClient.rig.update({
    where: { id: id },
    data: {
      name: name || isExistRig.name,
      companyId: companyId || isExistRig.companyId,
      location: location || isExistRig.location,
      latitude: latitude || isExistRig.latitude,
      longitude: longitude || isExistRig.longitude,
      rigTypeId: rigTypeId || isExistRig.rigTypeId,
      status: status || isExistRig.status,
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update rig!");
  }

  return result;
};

// permanent rig delete
export const deleteRigService = async (paramsId: any, companyId: any) => {
  const id = parseInt(paramsId);

  // build where condition
  const whereCondition: any = { id };

  if (companyId) {
    whereCondition.companyId = companyId;
  }

  // check rig  exist
  const isExistRig = await dbClient.rig.findUnique({
    where: whereCondition,
  });
  if (!isExistRig) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Rig doesn't exist!");
  }

  // delete rig
  const result = await dbClient.rig.delete({
    where: { id: id },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete rig!");
  }

  return result;
};

// fleet comparison
export const fleetComparisonService = async (payload: any) => {
  const { rigIds, startDay, endDay, companyId } = payload;

  let startDate = startDay ? new Date(startDay) : null;
  let endDate = endDay ? new Date(endDay) : null;

  // Default previous week (Monday to Sunday) if no dates provided
  if (!startDate && !endDate) {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...
    let daysToLastMonday = currentDay === 0 ? 6 : currentDay - 1;
    if (daysToLastMonday === 0 && currentDay === 1) daysToLastMonday = 7;

    const lastMonday = new Date(now);
    lastMonday.setDate(now.getDate() - daysToLastMonday);
    lastMonday.setHours(0, 0, 0, 0);

    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    lastSunday.setHours(23, 59, 59, 999);

    startDate = lastMonday;
    endDate = lastSunday;
  }

  if (!startDate || !endDate) {
    throw new Error("Invalid date range");
  }

  // Convert start and end dates to YYYY-MM-DD strings (local date)
  const formatYMD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const startYMD = formatYMD(startDate);
  const endYMD = formatYMD(endDate);

  // Generate all dates in the range (for chartData)
  const dateRangeList: Date[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dateRangeList.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Helper: format date as "DD Month, YYYY"
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Fetch rigs with card submissions filtered by submitDay (string comparison)
  const rigsData = await dbClient.rig.findMany({
    where: {
      id: { in: rigIds },
      companyId: companyId,
    },
    include: {
      cardSubmissions: {
        where: {
          submitDay: {
            gte: startYMD,
            lte: endYMD,
          },
        },
      },
    },
  });

  // Format the date range string for response
  const dateRangeString = `${formatDate(startDate)} - ${formatDate(endDate)}`;

  // Build response
  const responseData = rigsData.map((rig) => {
    const submissions = rig.cardSubmissions;

    // Totals
    const totalCardsSubmitted = submissions.length;
    const totalOpenCards = submissions.filter((s) => s.isOpened).length;
    const totalRiskSeverityHigh = submissions.filter(
      (s) => s.riskSeverity === "HIGH",
    ).length;

    // Build daily count map (key: YYYY-MM-DD)
    const dailyCountMap: Record<string, number> = {};
    submissions.forEach((sub) => {
      const dayKey = sub.submitDay; // already in YYYY-MM-DD format
      if (dayKey) {
        dailyCountMap[dayKey] = (dailyCountMap[dayKey] || 0) + 1;
      }
    });

    // Create chartData for all dates in range
    const chartData = dateRangeList.map((date) => ({
      date: formatDate(date),
      count: dailyCountMap[formatYMD(date)] || 0,
    }));

    // Return rig object with added metrics
    return {
      id: rig.id,
      name: rig.name,
      location: rig.location,
      latitude: rig.latitude,
      longitude: rig.longitude,
      rigTypeId: rig.rigTypeId,
      companyId: rig.companyId,
      status: rig.status,
      createdAt: rig.createdAt,
      updatedAt: rig.updatedAt,
      totalCardsSubmitted,
      totalOpenCards,
      totalRiskSeverityHigh,
      chartData,
    };
  });

  return {
    dateRange: dateRangeString,
    data: responseData,
  };
};
