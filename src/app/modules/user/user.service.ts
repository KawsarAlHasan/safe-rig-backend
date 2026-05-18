import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiError";
import { dbClient } from "../../../lib/prisma";
import { Prisma } from "../../../../generated/prisma/client";

import config from "../../../config";
import { statusName } from "../../../shared/statusName";
import generateOTP from "../../../util/generateOTP";
import { emailTemplate } from "../../../shared/emailTemplate";
import { emailHelper } from "../../../helpers/emailHelper";

// request client and rig
export const requestClientAndRigService = async (payload: any, id: number) => {
  const { client, rig } = payload;

  // check client
  if (client) {
    const isExistClient = await dbClient.company.findUnique({
      where: { id: client },
    });
    if (!isExistClient) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Client doesn't exist!");
    }
  }

  // check rig
  if (rig) {
    const isExistRig = await dbClient.rig.findUnique({
      where: { id: rig },
    });
    if (!isExistRig) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Rig doesn't exist!");
    }
  }

  // update user
  await dbClient.user.update({
    where: { id },
    data: {
      companyId: client,
      rigId: rig,
      approveStatus: "PENDING",
    },
  });

  return;
};

// update profile
export const updateProfileService = async (payload: any, user: any) => {
  const { name, entryCompany, position, phone, profile } = payload;

  // update user
  await dbClient.user.update({
    where: { id: user.id },
    data: {
      name: name ? name : user.name,
      entryCompany: entryCompany ? entryCompany : user.entryCompany,
      position: position ? position : user.position,
      phone: phone ? phone : user.phone,
      profile: profile ? profile : user.profile,
    },
  });

  return;
};

export const requestAcceptService = async (payload: any) => {
  const { id, companyId, approveStatus } = payload;

  // check user
  const isExistUser = await dbClient.user.findUnique({
    where: { id: id, companyId: companyId },
  });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // update user
  await dbClient.user.update({
    where: { id },
    data: {
      approveStatus: approveStatus,
    },
  });

  return;
};

// get all user with filter by companyId, rigId, status, approveStatus, isVerified and search by name and email and pagination
export const getAllUserService = async (query: any, companyId: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (companyId) {
    andConditions.push({
      companyId: Number(companyId),
    });
  } else if (query.companyId) {
    andConditions.push({
      companyId: Number(query.companyId),
    });
  }

  if (query.status) {
    andConditions.push({
      status: query.status as any,
    });
  } else {
    andConditions.push({
      NOT: {
        status: "DELETED",
      },
    });
  }

  if (query.rigId) {
    andConditions.push({
      rigId: Number(query.rigId),
    });
  }

  if (query.approveStatus) {
    andConditions.push({
      approveStatus: query.approveStatus as any,
    });
  } else {
    // andConditions.push({
    //   NOT: {
    //     approveStatus: "DELETED",
    //   },
    // });
  }

  if (query.isVerified) {
    andConditions.push({
      isVerified: query.isVerified as any,
    });
  }

  if (query.search) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: query.search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await dbClient.user.findMany({
    where: whereConditions,
    include: {
      rig: true,
      company: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
  });

  const total = await dbClient.user.count({
    where: whereConditions,
  });

  if (!result.length) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No user found!");
  }

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};
