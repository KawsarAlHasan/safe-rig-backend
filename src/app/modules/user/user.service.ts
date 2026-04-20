import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiError";
import { dbClient } from "../../../lib/prisma";
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

export const requestAcceptService = async (id: number) => {
  // check user
  const isExistUser = await dbClient.user.findUnique({
    where: { id },
  });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // update user
  await dbClient.user.update({
    where: { id },
    data: {
      approveStatus: "ACTIVE",
    },
  });

  return;
};
