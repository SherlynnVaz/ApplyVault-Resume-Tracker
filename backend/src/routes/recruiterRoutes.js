const express = require("express");
const { body } = require("express-validator");

const {
    listApplicants,
    getApplicantDetails,
    changeApplicationStatus,
    getDashboardStats
} = require("../controllers/recruiterController");
const { authenticate, authorize } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(authenticate, authorize("recruiter", "admin"));

router.get("/applicants", listApplicants);
router.get("/applicants/:applicationId", getApplicantDetails);
router.get("/dashboard-stats", getDashboardStats);

router.patch(
    "/applications/:applicationId/status",
    [body("status").trim().notEmpty().withMessage("Status is required")],
    validateRequest,
    changeApplicationStatus
);

module.exports = router;
