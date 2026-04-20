import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError";


// ✅ Allowed MIME types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/mpeg", "video/quicktime", "video/webm"];

const MAX_IMAGE_SIZE = 20 * 1024 * 1024;  // 2MB
const MAX_VIDEO_SIZE = 1000 * 1024 * 1024; // 1000MB

// ✅ Storage config (disk storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);
    const folder = isVideo ? "uploads/videos" : "uploads/images";
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// ✅ File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const isAllowed = [
    ...ALLOWED_IMAGE_TYPES,
    ...ALLOWED_VIDEO_TYPES,
  ].includes(file.mimetype);

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        "Only image (jpeg, png, webp, gif) or video (mp4, mpeg, mov, webm) files are allowed",
      ),
    );
  }
};

// ✅ Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_VIDEO_SIZE, // set max to video size; image check below
  },
});

// ✅ Main middleware
export const imageOrVideoUploadHandler = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Accept single file under field name "media"
    const uploadSingle = upload.single("media");

    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            new ApiError(
              StatusCodes.BAD_REQUEST,
              `File too large. Max size: Images ${MAX_IMAGE_SIZE / (1024 * 1024)}MB, Videos ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`,
            ),
          );
        }
        return next(new ApiError(StatusCodes.BAD_REQUEST, err.message));
      }

      if (err) {
        return next(err);
      }

      // ✅ Extra check: enforce image-specific size limit
      if (req.file) {
        const isImage = ALLOWED_IMAGE_TYPES.includes(req.file.mimetype);
        if (isImage && req.file.size > MAX_IMAGE_SIZE) {
          return next(
            new ApiError(
              StatusCodes.BAD_REQUEST,
              `Image file too large. Max size is ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
            ),
          );
        }
      }

      next();
    });
  };
};