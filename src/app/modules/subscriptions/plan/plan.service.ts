import { StatusCodes } from "http-status-codes";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";

// create initial plan data with duration features
export const planCreateService = async () => {
  const plansData = [
    {
      name: "Free",
      monthlyPrice: 0,
      quarterPrice: 0,
      sixMonthPrice: 0,
      yearlyPrice: 0,
      features: [
        "Monitor up to 5 rigs",
        "Basic performance metrics",
        "Daily status reports",
        "Email support",
        "7-day data retention",
        "Standard API access",
        "Real-time alerts",
        "Custom integrations",
      ],
    },
    {
      name: "Basic",
      monthlyPrice: 9.99,
      quarterPrice: 27.99,
      sixMonthPrice: 49.99,
      yearlyPrice: 99.99,
      features: [
        "Monitor up to 25 rigs",
        "Advanced performance analytics",
        "Real-time alert system",
        "Priority email & chat support",
        "30-day data retention",
        "Full API access",
        "Custom report builder",
        "White-label options",
      ],
    },
    {
      name: "Standard",
      monthlyPrice: 19,
      quarterPrice: 54,
      sixMonthPrice: 99,
      yearlyPrice: 230,
      features: [
        "Monitor up to 100 rigs",
        "Predictive maintenance AI",
        "Instant push notifications",
        "Priority support",
        "90-day data retention",
        "Dedicated API throughput",
        "Custom integrations & SSO",
        "White-label dashboard",
        "Team collaboration",
        "Anomaly detection",
      ],
    },
    {
      name: "Pro",
      monthlyPrice: 38,
      quarterPrice: 108,
      sixMonthPrice: 199,
      yearlyPrice: 460,
      features: [
        "Unlimited rig monitoring",
        "Predictive maintenance AI",
        "Instant SMS & Phone alerts",
        "24/7 Dedicated support agent",
        "Unlimited data retention",
        "Dedicated API throughput",
        "Custom integrations & SSO",
        "White-label dashboard",
        "Custom feature development",
        "99.9% SLA guarantee",
        "Dedicated account manager",
      ],
    },
  ];

  const plans = await dbClient.plan.createMany({
    data: plansData,
  });

  return plans;
};

// get all plan with features and their values
export const getAllPlansService = async (queryData: any) => {
  let whereCondition: any = {};

  if (!queryData?.status) {
    whereCondition.status = "ACTIVE";
  } else if (queryData.status !== "ALL") {
    whereCondition.status = queryData.status;
  }

  const plans = await dbClient.plan.findMany({
    where: whereCondition,
    orderBy: {
      monthlyPrice: "asc",
    }
  });

  return plans;
};

// updated plan
export const updatePlanService = async (planData: any) => {
  // check if plan exist
  const isExistPlan = await dbClient.plan.findUnique({
    where: {
      id: planData.id,
    },
  });
  if (!isExistPlan) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Plan doesn't exist!");
  }

  const result = await dbClient.plan.update({
    where: {
      id: planData.id,
    },
    data: {
      name: planData.name || isExistPlan.name,
      monthlyPrice: planData.monthlyPrice || isExistPlan.monthlyPrice,
      quarterPrice: planData.quarterPrice || isExistPlan.quarterPrice,
      sixMonthPrice: planData.sixMonthPrice || isExistPlan.sixMonthPrice,
      yearlyPrice: planData.yearlyPrice || isExistPlan.yearlyPrice,
      features: planData.features || isExistPlan.features,
      status: planData.status || isExistPlan.status,
    },
  });

  return result;
};
