import { StatusCodes } from "http-status-codes";
import ApiError from "../../../../errors/ApiError";
import { dbClient } from "../../../../lib/prisma";

// create new coupon
export const couponCreateService = async (payloadData: any) => {
  const {
    code,
    isAmount,
    amount,
    percentage,
    dateType,
    startDate,
    endDate,
    singleDate,
    plans,
  } = payloadData;

  // 1. Check duplicate coupon
  const isExistCoupon = await dbClient.coupon.findUnique({
    where: { code },
  });

  if (isExistCoupon) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Coupon already exists!");
  }

  // Helper: "YYYY-MM-DD" string → ISO DateTime
  const toDateTime = (dateStr: string | null): Date | null => {
    if (!dateStr) return null;
    const date = new Date(dateStr + "T00:00:00.000Z");
    if (isNaN(date.getTime())) return null;
    return date;
  };

  // 2. Create coupon
  const newCoupon = await dbClient.coupon.create({
    data: {
      code,
      isAmount,
      amount: isAmount ? amount : null,
      percentage: !isAmount ? percentage : null,
      dateType,
      startDate: dateType === "Range" ? toDateTime(startDate) : null,
      endDate: dateType === "Range" ? toDateTime(endDate) : null,
      singleDate: dateType === "Single" ? toDateTime(singleDate) : null,

      plans:
        plans && plans.length > 0
          ? {
              connect: plans.map((planId: number) => ({ id: planId })),
            }
          : undefined,
    },
    include: {
      plans: true,
    },
  });

  if (!newCoupon) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create coupon!");
  }

  return newCoupon;
};

// get all coupons with plans
export const getAllCouponService = async () => {
  const coupons = await dbClient.coupon.findMany({ include: { plans: true } });
  return coupons;
};

// delete coupon by id
export const deleteCouponService = async (couponId: any) => {
  const id = parseInt(couponId);

  // check coupon exist
  const isExistCoupon = await dbClient.coupon.findUnique({
    where: { id: id },
  });
  if (!isExistCoupon) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Coupon doesn't exist!");
  }

  // delete coupon
  const result = await dbClient.coupon.delete({
    where: { id: id },
  });

  return result;
};
