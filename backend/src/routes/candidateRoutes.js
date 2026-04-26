const express = require("express");

const {
    getProfile,
    applyToJob,
    getMyApplications
} = require("../controllers/candidateController");
const { authenticate, authorize } = require("../middleware/auth");
const { uploadResume } = require("../middleware/upload");

const router = express.Router();

router.use(authenticate, authorize("candidate"));

router.get("/profile", getProfile);
router.get("/applications", getMyApplications);
router.post("/apply/:jobId", uploadResume.single("resume"), applyToJob);

module.exports = router;
