import { StatusCodes } from "http-status-codes";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";
import { stripe } from "../../../../config/stripe";

export const buySubscription = async (payload: any, companyId: any) => {
  const { planId, coupon, price, paymentMethod, durationType, email, baseUrl } =
    payload;

  //  find plan by id
  const isExistPlan = await dbClient.plan.findUnique({
    where: { id: planId },
  });
  if (!isExistPlan) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Plan doesn't exist!");
  }

  const today = new Date();
  const startDate = today.toISOString().split("T")[0];
  let endDate = new Date(today);

  switch (durationType) {
    case "MONTHLY":
      endDate.setMonth(endDate.getMonth() + 1);
      break;

    case "QUARTELY":
      endDate.setMonth(endDate.getMonth() + 3);
      break;

    case "SIXMONTH":
      endDate.setMonth(endDate.getMonth() + 6);
      break;

    case "YEARLY":
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;

    default:
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid duration type");
  }

  const formattedEndDate = endDate.toISOString().split("T")[0];

  const subData = {
    companyId,
    planId: isExistPlan.id,
    coupon,
    price,
    paymentMethod,
    durationType,
    startDate,
    endDate: formattedEndDate,
  };

  const result = await dbClient.subscription.create({
    data: subData,
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Subscription failed!");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Subscription" },
          unit_amount: price * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "subscription",
      userId: String(companyId),
      planId: String(planId),
      subscriptionId: String(result.id),
    },
    success_url: `${baseUrl}/api/v1/credit/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/api/v1/credit/fail`,
  });

  return session.url;
};
