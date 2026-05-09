import { Request, Response } from "express";
import catchAsync from "../../../../shared/catchAsync";
import resolveCompanyId from "../../../../helpers/resolveCompanyId";
import {
  buySubscription,
  getMySubscriptionService,
} from "./subscription.service";
import sendResponse from "../../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

// buy subscription
export const subscriptionBuy = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const payload = {
      ...req.body,
      baseUrl,
    };

    const result = await buySubscription(payload, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Subscription created successfully",
      data: result,
    });
  },
);

// get getMySubscriptionService
export const getMySubscription = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    const result = await getMySubscriptionService(companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Subscription fetched successfully",
      data: result,
    });
  },
);
