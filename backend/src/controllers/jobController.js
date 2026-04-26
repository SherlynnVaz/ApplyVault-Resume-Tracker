const { createJob, deleteJob, getAllJobs, getJobById } = require("../models/jobModel");
const asyncHandler = require("../utils/asyncHandler");

const listJobs = asyncHandler(async (req, res) => {
    const { search = "" } = req.query;
    const jobs = await getAllJobs({ search });

    return res.status(200).json({ jobs });
});

const getJobDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const job = await getJobById(id);
    if (!job) {
        return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({ job });
});

const createJobPosting = asyncHandler(async (req, res) => {
    const { title, company, location, description } = req.body;

    const job = await createJob({
        title,
        company,
        location,
        description
    });

    return res.status(201).json({
        message: "Job created successfully",
        job
    });
});

const deleteJobPosting = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await deleteJob(id);

    if (!deleted) {
        return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({ message: "Job deleted successfully" });
});

module.exports = {
    listJobs,
    getJobDetails,
    createJobPosting,
    deleteJobPosting
};
