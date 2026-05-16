import { Request } from "express";

// Resolve Company ID
export const resolveCompanyId = (req: Request): string => {
  const decodedAdmin = (req as any).decodedAdmin;
  const decodedClient = (req as any).decodedClient;
  const decodedUser = (req as any).decodedUser;

  // Admin body থেকে নিবে
  if (decodedAdmin) {
    return req?.body?.companyId;
  }

  // User token থেকে নিবে
  if (decodedUser) {
    return decodedUser.companyId;
  }

  // Client token থেকে নিবে
  return decodedClient.companyId;
};

// Resolve Rig ID
export const resolveRigId = (req: Request): string => {
  const decodedAdmin = (req as any).decodedAdmin;
  const decodedClient = (req as any).decodedClient;
  const decodedUser = (req as any).decodedUser;

  // Admin body থেকে নিবে
  if (decodedAdmin) {
    return req?.body?.rigId;
  }

  // User token থেকে নিবে
  if (decodedUser) {
    return decodedUser.rigId;
  }

  // Client token থেকে নিবে
  return decodedClient.rigId;
};