const fs = require("fs");
const pdf = require("pdf-parse");

const COMMON_SKILLS = [
    "javascript",
    "typescript",
    "react",
    "node",
    "express",
    "mysql",
    "mongodb",
    "python",
    "java",
    "c++",
    "aws",
    "docker",
    "kubernetes",
    "git",
    "html",
    "css",
    "tailwind",
    "rest api",
    "sql",
    "data structures",
    "machine learning"
];

const extractEmail = (text) => {
    const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    return match ? match[0] : "";
};

const extractPhone = (text) => {
    const match = text.match(/(\+?\d{1,3}[\s-]?)?(\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}/);
    return match ? match[0] : "";
};

const extractName = (text) => {
    const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    if (!lines.length) {
        return "";
    }

    const likelyName = lines.find((line) => /^[A-Za-z][A-Za-z\s.'-]{2,40}$/.test(line));
    return likelyName || lines[0];
};

const extractSkills = (text) => {
    const lower = text.toLowerCase();
    const found = COMMON_SKILLS.filter((skill) => lower.includes(skill));
    return [...new Set(found)].join(", ");
};

const extractEducation = (text) => {
    const educationMatches = [];
    const lines = text.split("\n");
    const educationPattern = /(b\.tech|btech|b\.e|be|m\.tech|mtech|mba|bsc|msc|bca|mca|bachelor|master|university|college)/i;

    lines.forEach((line) => {
        const clean = line.trim();
        if (educationPattern.test(clean) && clean.length < 120) {
            educationMatches.push(clean);
        }
    });

    return [...new Set(educationMatches)].slice(0, 6).join(" | ");
};

const resolveResumeBuffer = (input) => {
    if (Buffer.isBuffer(input)) {
        return input;
    }

    if (input && Buffer.isBuffer(input.buffer)) {
        return input.buffer;
    }

    if (input && input.filePath) {
        return fs.readFileSync(input.filePath);
    }

    if (typeof input === "string") {
        return fs.readFileSync(input);
    }

    throw new Error("No valid resume content provided for parsing");
};

const parseResume = async (resumeInput) => {
    const buffer = resolveResumeBuffer(resumeInput);
    const data = await pdf(buffer);
    const text = data.text || "";

    return {
        extractedName: extractName(text),
        extractedEmail: extractEmail(text),
        extractedPhone: extractPhone(text),
        skills: extractSkills(text),
        education: extractEducation(text),
        extractedText: text.slice(0, 8000)
    };
};

module.exports = {
    parseResume
};
