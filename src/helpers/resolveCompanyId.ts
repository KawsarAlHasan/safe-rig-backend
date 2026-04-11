import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../errors/ApiError";

const resolveCompanyId = (req: Request): string => {
  const decodedAdmin = (req as any).decodedAdmin;
  const decodedClient = (req as any).decodedClient;

  if (decodedAdmin) {
    return req?.body?.companyId;
  }

  return decodedClient.id;
};

export default resolveCompanyId;
