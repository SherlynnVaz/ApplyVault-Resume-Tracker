const express = require("express");
const { body } = require("express-validator");

const {
    listJobs,
    getJobDetails,
    createJobPosting,
    deleteJobPosting
} = require("../controllers/jobController");
const { authenticate, authorize } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/", listJobs);
router.get("/:id", getJobDetails);

router.post(
    "/",
    authenticate,
    authorize("recruiter", "admin"),
    [
        body("title").trim().notEmpty().withMessage("Title is required"),
        body("company").trim().notEmpty().withMessage("Company is required"),
        body("location").trim().notEmpty().withMessage("Location is required"),
        body("description").trim().notEmpty().withMessage("Description is required")
    ],
    validateRequest,
    createJobPosting
);

router.delete("/:id", authenticate, authorize("recruiter", "admin"), deleteJobPosting);

module.exports = router;
