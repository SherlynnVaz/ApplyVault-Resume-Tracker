const {
    getAllApplicants,
    updateApplicationStatus,
    getApplicationById,
    getRecruiterStats
} = require("../models/applicationModel");
const { APPLICATION_STATUSES } = require("../config/constants");
const { publishNotification } = require("../services/snsService");
const { sendCandidateSelectedEmail } = require("../services/emailService");
const asyncHandler = require("../utils/asyncHandler");

const listApplicants = asyncHandler(async (req, res) => {
    const { search = "", status = "", jobId = "" } = req.query;

    const applicants = await getAllApplicants({ search, status, jobId });

    return res.status(200).json({ applicants });
});

const getApplicantDetails = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;

    const application = await getApplicationById(applicationId);

    if (!application) {
        return res.status(404).json({ message: "Application not found" });
    }

    return res.status(200).json({ application });
});

const changeApplicationStatus = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!APPLICATION_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Invalid application status" });
    }

    const updated = await updateApplicationStatus({ applicationId, status });

    if (!updated) {
        return res.status(404).json({ message: "Application not found" });
    }

    const application = await getApplicationById(applicationId);

    await publishNotification({
        subject: "ApplyVault: Application Status Updated",
        message: JSON.stringify(
            {
                eventType: "application_status_updated",
                applicationId: Number(applicationId),
                status,
                candidateId: application ? application.user_id : null,
                candidateEmail: application ? application.candidate_email : null,
                candidateName: application ? application.candidate_name : null,
                jobId: application ? application.job_id : null,
                jobTitle: application ? application.job_title : null,
                company: application ? application.company : null
            },
            null,
            2
        ),
        attributes: {
            eventType: "application_status_updated",
            applicationId,
            status
        }
    }).catch((error) => {
        console.error("SNS publish failed for application_status_updated:", error.message || error);
    });

    if (status === "Selected") {
        await sendCandidateSelectedEmail({
            toEmail: application ? application.candidate_email : null,
            candidateName: application ? application.candidate_name : null,
            jobTitle: application ? application.job_title : null,
            company: application ? application.company : null
        }).catch((error) => {
            console.error("SES email failed for candidate selection:", error.message || error);
        });
    }

    return res.status(200).json({ message: "Application status updated" });
});

const getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await getRecruiterStats();
    return res.status(200).json(stats);
});

module.exports = {
    listApplicants,
    getApplicantDetails,
    changeApplicationStatus,
    getDashboardStats
};
