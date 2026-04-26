const { pool } = require("../config/db");

const createApplication = async ({ userId, jobId, resumePath, status = "Pending" }) => {
    const [result] = await pool.execute(
        "INSERT INTO applications (user_id, job_id, resume_path, status) VALUES (?, ?, ?, ?)",
        [userId, jobId, resumePath, status]
    );

    return result.insertId;
};

const getApplicationById = async (applicationId) => {
    const [rows] = await pool.execute(
        `SELECT a.id, a.user_id, a.job_id, a.resume_path, a.status, a.created_at,
            u.name AS candidate_name, u.email AS candidate_email,
            j.title AS job_title, j.company, j.location,
            pr.extracted_name, pr.extracted_email, pr.extracted_phone,
            pr.skills, pr.education, pr.extracted_text
     FROM applications a
     INNER JOIN users u ON u.id = a.user_id
     INNER JOIN jobs j ON j.id = a.job_id
     LEFT JOIN parsed_resumes pr ON pr.application_id = a.id
     WHERE a.id = ?
     LIMIT 1`,
        [applicationId]
    );

    return rows[0] || null;
};

const getApplicationByUserAndJob = async ({ userId, jobId }) => {
    const [rows] = await pool.execute(
        "SELECT id FROM applications WHERE user_id = ? AND job_id = ? LIMIT 1",
        [userId, jobId]
    );

    return rows[0] || null;
};

const getApplicationsByUser = async (userId) => {
    const [rows] = await pool.execute(
        `SELECT a.id, a.resume_path, a.status, a.created_at,
            j.id AS job_id, j.title, j.company, j.location,
            pr.skills, pr.education
     FROM applications a
     INNER JOIN jobs j ON j.id = a.job_id
     LEFT JOIN parsed_resumes pr ON pr.application_id = a.id
     WHERE a.user_id = ?
     ORDER BY a.created_at DESC`,
        [userId]
    );

    return rows;
};

const getAllApplicants = async ({ search = "", status = "", jobId = "" } = {}) => {
    const wildcard = `%${search}%`;

    const [rows] = await pool.execute(
        `SELECT a.id, a.status, a.resume_path, a.created_at,
            u.id AS user_id, u.name, u.email,
            j.id AS job_id, j.title AS job_title, j.company,
            pr.extracted_name, pr.extracted_email, pr.extracted_phone,
            pr.skills, pr.education
     FROM applications a
     INNER JOIN users u ON u.id = a.user_id
     INNER JOIN jobs j ON j.id = a.job_id
     LEFT JOIN parsed_resumes pr ON pr.application_id = a.id
     WHERE (? = '' OR a.status = ?)
       AND (? = '' OR j.id = ?)
       AND (
         ? = ''
         OR u.name LIKE ?
         OR u.email LIKE ?
         OR IFNULL(pr.skills, '') LIKE ?
       )
     ORDER BY a.created_at DESC`,
        [status, status, jobId, jobId, search, wildcard, wildcard, wildcard]
    );

    return rows;
};

const updateApplicationStatus = async ({ applicationId, status }) => {
    const [result] = await pool.execute(
        "UPDATE applications SET status = ? WHERE id = ?",
        [status, applicationId]
    );

    return result.affectedRows > 0;
};

const getRecruiterStats = async () => {
    const [statusRows] = await pool.execute(
        `SELECT status, COUNT(*) AS count
     FROM applications
     GROUP BY status`
    );

    const [summaryRows] = await pool.execute(
        `SELECT
      (SELECT COUNT(*) FROM users WHERE role = 'candidate') AS total_candidates,
      (SELECT COUNT(*) FROM jobs) AS total_jobs,
      (SELECT COUNT(*) FROM applications) AS total_applications`
    );

    return {
        statusBreakdown: statusRows,
        summary: summaryRows[0]
    };
};

module.exports = {
    createApplication,
    getApplicationById,
    getApplicationByUserAndJob,
    getApplicationsByUser,
    getAllApplicants,
    updateApplicationStatus,
    getRecruiterStats
};
