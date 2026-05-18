import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";

import { resolveCompanyId } from "../../../../helpers/resolveCompanyId";
import {
  createDebriefQuestionService,
  deleteDebriefQuestionService,
  getAllDebriefQuestionService,
  updateDebriefQuestionService,
} from "./debriefQuestion.service";

// create new DebriefQuestion
export const createNewDebriefQuestion = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    await createDebriefQuestionService(req.body, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Debrief Question created successfully",
    });
  },
);

// get DebriefQuestion
export const getDebriefQuestion = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    const result = await getAllDebriefQuestionService(req.query, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Debrief Question fetched successfully",
      data: result,
    });
  },
);

// update DebriefQuestion
export const updateDebriefQuestion = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);

    await updateDebriefQuestionService(req.body, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Debrief Question updated successfully",
    });
  },
);

// Delete permanent DebriefQuestion
export const permanentDeleteDebriefQuestion = catchAsync(
  async (req: Request, res: Response) => {
    const companyId = resolveCompanyId(req);
    const id = req.params.id;

    await deleteDebriefQuestionService(id, companyId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Debrief Question deleted successfully",
    });
  },
);
