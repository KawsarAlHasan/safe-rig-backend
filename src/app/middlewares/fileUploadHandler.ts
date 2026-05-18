import { Request } from "express";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import ApiError from "../../errors/ApiError";

const fileUploadHandler = () => {
  //create upload folder
  const baseUploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir);
  }

  //folder create for different file
  const createDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  };

  //create filename
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadDir;
      switch (file.fieldname) {
        case "image":
          uploadDir = path.join(baseUploadDir, "images");
          break;
        case "media":
          uploadDir = path.join(baseUploadDir, "medias");
          break;
        case "doc":
          uploadDir = path.join(baseUploadDir, "docs");
          break;
        default:
          throw new ApiError(StatusCodes.BAD_REQUEST, "File is not supported");
      }
      createDir(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName =
        file.originalname
          .replace(fileExt, "")
          .toLowerCase()
          .split(" ")
          .join("-") +
        "-" +
        Date.now();
      cb(null, fileName + fileExt);
    },
  });

  //file filter
  const filterFilter = (req: Request, file: any, cb: FileFilterCallback) => {
    if (file.fieldname === "image") {
      const allowedImages = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/avif",
        "image/svg+xml",
      ];

      if (allowedImages.includes(file.mimetype)) {
        cb(null, true);
      } else {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Only .jpeg, .png, .webp, .gif, .avif, .svg files are supported",
        );
      }
    } else if (file.fieldname === "media") {
      const allowedMedia = [
        "video/mp4",
        "video/webm",
        "video/x-matroska", // mkv
        "video/quicktime", // mov
        "audio/mpeg", // mp3
        "audio/wav",
        "audio/ogg",
      ];

      if (allowedMedia.includes(file.mimetype)) {
        cb(null, true);
      } else {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Only mp4, webm, mkv, mov, mp3, wav, ogg files are supported",
        );
      }
    } else if (file.fieldname === "doc") {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Only pdf supported");
      }
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, "This file is not supported");
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: filterFilter,
  }).fields([
    { name: "image", maxCount: 3 },
    { name: "media", maxCount: 3 },
    { name: "doc", maxCount: 3 },
  ]);
  return upload;
};

export default fileUploadHandler;
