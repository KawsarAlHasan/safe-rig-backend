import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import config from "../config/index";

type payload = {
  id: number;
  role: "client" | "user" | "admin" | "rig_admin";
};

export const createAuthToken = (payload: payload) => {
  const role = payload.role;

  const secret = config.jwt[`${role}_jwt_secret` as keyof typeof config.jwt];

  if (!secret) {
    throw new Error(`JWT secret not found for role: ${role}`);
  }

  return jwt.sign(payload, secret as string, {
    expiresIn: "60days",
  });
};

export const verifyAuthToken = (token: string, role: string) => {
  const secret = config.jwt[`${role}_jwt_secret` as keyof typeof config.jwt];

  if (!secret) {
    throw new Error(`JWT secret not found for role: ${role}`);
  }
  return jwt.verify(token, secret as Secret) as JwtPayload;
};
