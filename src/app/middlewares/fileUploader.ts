import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "video") {
      cb(null, "uploads/videos/");
    } else if (file.fieldname === "thumbnail") {
      cb(null, "uploads/images/");
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (file.fieldname === "video") {
    const allowed = [
      "video/mp4",
      "video/webm",
      "video/x-matroska", // .mkv
      "video/x-msvideo", // .avi
      "video/quicktime", // .mov
      "video/x-ms-wmv", // .wmv
      "video/mpeg", // .mpeg
      "video/3gpp", // .3gp
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only video files allowed!"), false);
    }
  } else if (file.fieldname === "thumbnail") {
    const allowed = [
      "image/jpeg", // .jpg .jpeg
      "image/png", // .png
      "image/webp", // .webp
      "image/gif", // .gif
      "image/svg+xml", // .svg
      "image/avif", // .avif
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed!"), false);
    }
  }
};

export const uploadVideoWithThumbnail = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
}).fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);
