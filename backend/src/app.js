const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();
const resumeStorageMode = (
  process.env.RESUME_STORAGE || (process.env.AWS_LAMBDA_FUNCTION_NAME ? "s3" : "local")
).toLowerCase();
const normalizedStage = (process.env.API_STAGE_PREFIX || "").replace(/^\/+|\/+$/g, "");
const stagePrefix = normalizedStage ? `/${normalizedStage}` : "";

if (stagePrefix) {
  app.use((req, _res, next) => {
    if (typeof req.url === "string" && req.url.startsWith(`${stagePrefix}/`)) {
      req.url = req.url.slice(stagePrefix.length) || "/";
    }
    next();
  });
}

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

if (resumeStorageMode !== "s3") {
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
}

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "ApplyVault API is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/recruiter", recruiterRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
