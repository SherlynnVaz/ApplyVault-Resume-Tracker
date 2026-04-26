const { pool } = require("../config/db");

const getAllJobs = async ({ search = "" } = {}) => {
    const wildcard = `%${search}%`;

    const [rows] = await pool.execute(
        `SELECT id, title, company, location, description, created_at
     FROM jobs
     WHERE (? = '' OR title LIKE ? OR company LIKE ? OR location LIKE ?)
     ORDER BY created_at DESC`,
        [search, wildcard, wildcard, wildcard]
    );

    return rows;
};

const getJobById = async (id) => {
    const [rows] = await pool.execute(
        "SELECT id, title, company, location, description, created_at FROM jobs WHERE id = ? LIMIT 1",
        [id]
    );

    return rows[0] || null;
};

const createJob = async ({ title, company, location, description }) => {
    const [result] = await pool.execute(
        "INSERT INTO jobs (title, company, location, description) VALUES (?, ?, ?, ?)",
        [title, company, location, description]
    );

    return getJobById(result.insertId);
};

const deleteJob = async (id) => {
    const [result] = await pool.execute("DELETE FROM jobs WHERE id = ?", [id]);
    return result.affectedRows > 0;
};

module.exports = {
    getAllJobs,
    getJobById,
    createJob,
    deleteJob
};
