const { pool } = require("../config/db");

const createUser = async ({ name, email, password, role }) => {
    const [result] = await pool.execute(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, password, role]
    );

    return { id: result.insertId, name, email, role };
};

const findUserByEmail = async (email) => {
    const [rows] = await pool.execute(
        "SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1",
        [email]
    );

    return rows[0] || null;
};

const findUserById = async (id) => {
    const [rows] = await pool.execute(
        "SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1",
        [id]
    );

    return rows[0] || null;
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById
};
