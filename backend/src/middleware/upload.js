const multer = require("multer");
const fs = require("fs");
const path = require("path");

const resumeStorageMode = (
  process.env.RESUME_STORAGE || (process.env.AWS_LAMBDA_FUNCTION_NAME ? "s3" : "local")
).toLowerCase();

const localDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir =
      process.env.UPLOAD_DIR || path.join(__dirname, "../../uploads/resumes");
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname.replace(/\s+/g, "_")}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF resumes are allowed"));
  }

  return cb(null, true);
};

const uploadResume = multer({
  storage: resumeStorageMode === "s3" ? multer.memoryStorage() : localDiskStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = {
  uploadResume
};
