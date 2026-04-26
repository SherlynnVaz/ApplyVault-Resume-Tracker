const { pool } = require("../config/db");

const createParsedResume = async ({
    applicationId,
    extractedName,
    extractedEmail,
    extractedPhone,
    skills,
    education,
    extractedText
}) => {
    const [result] = await pool.execute(
        `INSERT INTO parsed_resumes (
      application_id,
      extracted_name,
      extracted_email,
      extracted_phone,
      skills,
      education,
      extracted_text
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            applicationId,
            extractedName,
            extractedEmail,
            extractedPhone,
            skills,
            education,
            extractedText
        ]
    );

    return result.insertId;
};

module.exports = {
    createParsedResume
};
