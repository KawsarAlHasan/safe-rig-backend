import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError";
import { verifyAuthToken } from "../../helpers/jwtHelper";
import { dbClient } from "../../lib/prisma";

// verify admin
export const adminAuth = (checkSupperAdmin = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers?.authorization?.split(" ")?.[1];
      if (!token) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized");
      }

      const decoded = verifyAuthToken(token, "admin");

      // get admin from db
      const admin = await dbClient.admin.findUnique({
        where: {
          id: decoded.id,
        },
      });

      if (!admin) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          "No admin found. Please login again",
        );
      }

      if (admin.status !== "ACTIVE") {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          "Your account is not active. Please contact support",
        );
      }

      (req as any).decodedAdmin = admin;
      next();
    } catch (error: any) {
      next(error);
    }
  };
};

// verify client
export const clientAuth = (checkMainClient = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers?.authorization?.split(" ")?.[1];
      if (!token) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized");
      }

      const decoded = verifyAuthToken(token, "client");

      // get client from db
      const client = await dbClient.client.findUnique({
        where: {
          id: decoded.id,
        },
      });

      if (!client) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          "No client found. Please login again",
        );
      }

      if (client.status !== "ACTIVE") {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          "Your account is not active. Please contact support",
        );
      }

      if (client.isVerified === false) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          "Your account is not verified. Please verify your account first",
        );
      }

      // check main client
      if (checkMainClient && client.isMainClient === false) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "You don't have permission to access this api",
        );
      }

      (req as any).decodedClient = client;
      next();
    } catch (error: any) {
      next(error);
    }
  };
};

// verify user
export const userAuth = (checkMainClient = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers?.authorization?.split(" ")?.[1];
      if (!token) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized");
      }

      const decoded = verifyAuthToken(token, "user");

      // get client from db
      const client = await dbClient.client.findUnique({
        where: {
          id: decoded.id,
        },
      });

      if (!client) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          "No client found. Please login again",
        );
      }

      if (client.status !== "ACTIVE") {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          "Your account is not active. Please contact support",
        );
      }

      if (client.isVerified === false) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          "Your account is not verified. Please verify your account first",
        );
      }

      // check main client
      if (checkMainClient && client.isMainClient === false) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "You don't have permission to access this api",
        );
      }

      (req as any).decodedClient = client;
      next();
    } catch (error: any) {
      next(error);
    }
  };
};

// verify rig admin
export const rigAdminAuth = (checkMainClient = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers?.authorization?.split(" ")?.[1];
      if (!token) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized");
      }

      const decoded = verifyAuthToken(token, "rig_admin");

      // get client from db
      const client = await dbClient.client.findUnique({
        where: {
          id: decoded.id,
        },
      });

      if (!client) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          "No client found. Please login again",
        );
      }

      if (client.status !== "ACTIVE") {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          "Your account is not active. Please contact support",
        );
      }

      if (client.isVerified === false) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          "Your account is not verified. Please verify your account first",
        );
      }

      // check main client
      if (checkMainClient && client.isMainClient === false) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "You don't have permission to access this api",
        );
      }

      (req as any).decodedClient = client;
      next();
    } catch (error: any) {
      next(error);
    }
  };
};
