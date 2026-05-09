import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../errors/ApiError";

const resolveCompanyId = (req: Request): string => {
  const decodedAdmin = (req as any).decodedAdmin;
  const decodedClient = (req as any).decodedClient;
  const decodedUser = (req as any).decodedUser;

  if (decodedAdmin) {
    return req?.body?.companyId;
  }

  if (decodedUser) {
    return decodedUser.companyId;
  }

  return decodedClient.companyId;
};

export default resolveCompanyId;
