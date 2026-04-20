import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../../generated/prisma/client";
import bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiError";
import { dbClient } from "../../../lib/prisma";
import config from "../../../config";
import { statusName } from "../../../shared/statusName";
import { IQuery } from "../../../types/company";

// create new company
export const companyCreateService = async (payload: any) => {
  const { name, email, phone, clientName, clientEmail, clientPassword, logo } =
    payload;

  // check if company exist
  const isExistCompany = await dbClient.company.findUnique({
    where: { name },
  });
  if (isExistCompany) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Company already exists!");
  }

  // check if client exist
  const isExistClient = await dbClient.client.findUnique({
    where: { email: clientEmail },
  });
  if (isExistClient) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Client already exists!");
  }

  // create Company
  const result = await dbClient.company.create({
    data: {
      name,
      email,
      phone,
      logo,
    },
  });

  // check company creation
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create company!");
  }

  //hash password
  const hashedPassword = await bcrypt.hash(
    clientPassword,
    Number(config.bcrypt_salt_rounds),
  );

  // create client
  await dbClient.client.create({
    data: {
      name: clientName,
      email: clientEmail,
      password: hashedPassword,
      isMainClient: true,
      companyId: result.id,
    },
  });

  return result;
};

// get all company
export const getAllCompanyService = async (query: IQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const andConditions: Prisma.CompanyWhereInput[] = [];

  // Company search (name, email, phone)
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
        {
          phone: {
            contains: query.search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  // Main Client search (name/email)
  if (query.clientSearch) {
    andConditions.push({
      clients: {
        some: {
          isMainClient: true,
          OR: [
            {
              name: {
                contains: query.clientSearch,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: query.clientSearch,
                mode: "insensitive",
              },
            },
          ],
        },
      },
    });
  }

  // status filter
  if (query.status) {
    andConditions.push({
      status: query.status as any,
    });
  } else {
    // exclude DELETED by default
    andConditions.push({
      NOT: {
        status: "DELETED",
      },
    });
  }

  const whereCondition: Prisma.CompanyWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await dbClient.company.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: {
      id: "desc",
    },
    include: {
      clients: {
        where: {
          isMainClient: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  const total = await dbClient.company.count({
    where: whereCondition,
  });

  if (!result.length) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No company found!");
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

// get company with rigs
export const getCompanyWithRigsService = async () => {
  const result = await dbClient.company.findMany({
    where: {
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      rigs: {
        select: {
          id: true,
          name: true,
          location: true,
        },
      },
    },
  });

  return result;
};

// Update an existing Company
export const updateCompanyService = async (payload: any) => {
  const {
    id,
    name,
    email,
    phone,
    clientName,
    clientEmail,
    clientPassword,
    logo,
  } = payload;

  // check Company exist
  const isExistCompany = await dbClient.company.findUnique({
    where: { id: id },
    include: {
      clients: {
        where: {
          isMainClient: true,
        },
      },
    },
  });

  if (!isExistCompany) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Company doesn't exist!");
  }

  // check duplicate name
  if (name && name !== isExistCompany.name) {
    const isDuplicateName = await dbClient.company.findUnique({
      where: { name: name },
    });

    if (isDuplicateName) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Company with name ${name} already exists!`,
      );
    }
  }

  const isExistClient = isExistCompany?.clients[0];

  // check duplicate email
  if (clientEmail && clientEmail !== isExistClient?.email) {
    const isDuplicateEmail = await dbClient.client.findUnique({
      where: { email: clientEmail },
    });

    if (isDuplicateEmail) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Client with email ${clientEmail} already exists!`,
      );
    }
  }

  // update Company
  const result = await dbClient.company.update({
    where: { id: id },
    data: {
      name: name || isExistCompany.name,
      email: email || isExistCompany.email,
      phone: phone || isExistCompany.phone,
      logo: logo || isExistCompany.logo,
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update company!");
  }

  if (clientName || clientEmail || clientPassword) {
    if (isExistClient) {
      //hash password
      const hashedPassword = clientPassword
        ? await bcrypt.hash(clientPassword, Number(config.bcrypt_salt_rounds))
        : isExistClient.password;

      await dbClient.client.update({
        where: { id: isExistClient.id },
        data: {
          name: clientName || isExistClient.name,
          email: clientEmail || isExistClient.email,
          password: hashedPassword,
          isMainClient: true,
        },
      });
    } else {
      const hashedPassword = await bcrypt.hash(
        clientPassword || "12345678",
        Number(config.bcrypt_salt_rounds),
      );
      await dbClient.client.create({
        data: {
          name: clientName,
          email: clientEmail,
          password: hashedPassword,
          isMainClient: true,
          companyId: id,
        },
      });
    }
  }

  return result;
};

// status change
export const updateCompanyStatusService = async (payload: any) => {
  const { id, status } = payload;

  if (!statusName.includes(status)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid status!");
  }

  // check Company exist
  const isExistCompany = await dbClient.company.findUnique({
    where: { id: id },
  });
  if (!isExistCompany) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Company doesn't exist!");
  }

  // status change
  const result = await dbClient.company.update({
    where: { id: id },
    data: {
      status: status,
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to status change!");
  }

  return result;
};

// permanent company delete
export const deleteCompanyService = async (companyId: any) => {
  const id = parseInt(companyId);

  // check Company exist
  const isExistCompany = await dbClient.company.findUnique({
    where: { id: id },
  });
  if (!isExistCompany) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Company doesn't exist!");
  }

  // delete Company
  const result = await dbClient.company.delete({
    where: { id: id },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete company!");
  }

  return result;
};
