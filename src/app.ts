import cors from "cors";
import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import path from "path";
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';
import { dbClient } from "./lib/prisma";
const app = express();

//body parser
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//file retrieve
app.use(express.static("uploads"));

//router
app.use('/api/v1', router);

//live response
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../uploads", "index.html"));
});


//global error handle
app.use(globalErrorHandler);

//handle not found route;
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "API DOESN'T EXIST",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  });
});

export default app;
