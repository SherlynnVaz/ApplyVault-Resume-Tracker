const path = require("path");

const { getJobById } = require("../models/jobModel");
const { findUserById } = require("../models/userModel");
const {
    createApplication,
    getApplicationByUserAndJob,
    getApplicationsByUser
} = require("../models/applicationModel");
const { createParsedResume } = require("../models/parsedResumeModel");
const { parseResume } = require("../services/resumeParserService");
const { uploadResumeToS3 } = require("../services/s3ResumeService");
const { publishNotification } = require("../services/snsService");
const asyncHandler = require("../utils/asyncHandler");

const resumeStorageMode = (
    process.env.RESUME_STORAGE || (process.env.AWS_LAMBDA_FUNCTION_NAME ? "s3" : "local")
).toLowerCase();

const getProfile = asyncHandler(async (req, res) => {
    const user = await findUserById(req.user.id);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
});

const applyToJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    const currentUser = await findUserById(req.user.id);
    if (!currentUser) {
        return res.status(401).json({ message: "Session is invalid. Please log in again." });
    }

    if (!req.file) {
        return res.status(400).json({ message: "Resume PDF is required" });
    }

    const job = await getJobById(jobId);
    if (!job) {
        return res.status(404).json({ message: "Job not found" });
    }

    const existingApplication = await getApplicationByUserAndJob({
        userId: currentUser.id,
        jobId
    });

    if (existingApplication) {
        return res.status(409).json({ message: "You already applied for this job" });
    }

    let resumePath = "";
    let parserInput;

    if (resumeStorageMode === "s3") {
        const uploadedResume = await uploadResumeToS3({
            buffer: req.file.buffer,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype
        });

        resumePath = uploadedResume.url;
        parserInput = { buffer: req.file.buffer };
    } else {
        resumePath = path.posix.join("/uploads/resumes", req.file.filename);
        parserInput = { filePath: req.file.path };
    }

    const applicationId = await createApplication({
        userId: currentUser.id,
        jobId,
        resumePath
    });

    const parsed = await parseResume(parserInput);

    await createParsedResume({
        applicationId,
        extractedName: parsed.extractedName,
        extractedEmail: parsed.extractedEmail,
        extractedPhone: parsed.extractedPhone,
        skills: parsed.skills,
        education: parsed.education,
        extractedText: parsed.extractedText
    });

    await publishNotification({
        subject: "ApplyVault: New Job Application",
        message: JSON.stringify(
            {
                eventType: "application_submitted",
                applicationId,
                jobId: Number(jobId),
                candidateId: currentUser.id,
                candidateEmail: currentUser.email || "",
                candidateName: currentUser.name || "",
                status: "Pending"
            },
            null,
            2
        ),
        attributes: {
            eventType: "application_submitted",
            applicationId,
            status: "Pending"
        }
    }).catch((error) => {
        console.error("SNS publish failed for application_submitted:", error.message || error);
    });

    return res.status(201).json({
        message: "Applied successfully and resume parsed",
        applicationId,
        parsedSummary: {
            name: parsed.extractedName,
            email: parsed.extractedEmail,
            phone: parsed.extractedPhone,
            skills: parsed.skills,
            education: parsed.education
        }
    });
});

const getMyApplications = asyncHandler(async (req, res) => {
    const applications = await getApplicationsByUser(req.user.id);

    return res.status(200).json({ applications });
});

module.exports = {
    getProfile,
    applyToJob,
    getMyApplications
};
