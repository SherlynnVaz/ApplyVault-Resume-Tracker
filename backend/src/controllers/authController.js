const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { APP_ROLES } = require("../config/constants");
const { createUser, findUserByEmail } = require("../models/userModel");
const asyncHandler = require("../utils/asyncHandler");

const jwtSecret =
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV === "production" ? "" : "dev-only-jwt-secret-change-me");

const generateToken = (user) => {
    if (!jwtSecret) {
        throw new Error("JWT_SECRET must be set in production");
    }

    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        },
        jwtSecret,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );
};

const registerCandidate = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        return res.status(409).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({
        name,
        email,
        password: hashedPassword,
        role: APP_ROLES.CANDIDATE
    });

    const token = generateToken(user);

    return res.status(201).json({
        message: "Candidate registered successfully",
        token,
        user
    });
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    return res.status(200).json({
        message: "Login successful",
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
});

module.exports = {
    registerCandidate,
    loginUser
};
