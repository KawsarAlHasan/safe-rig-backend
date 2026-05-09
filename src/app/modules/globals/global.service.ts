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
