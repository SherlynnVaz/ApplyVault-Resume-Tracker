const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const resumeBucket = process.env.RESUME_S3_BUCKET;
const awsRegion = process.env.AWS_REGION || "us-east-1";

let s3Client;

const getS3Client = () => {
    if (!s3Client) {
        s3Client = new S3Client({ region: awsRegion });
    }

    return s3Client;
};

const buildResumeKey = (originalName = "resume.pdf") => {
    const safeName = originalName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    return `resumes/${uniqueSuffix}-${safeName}`;
};

const buildPublicUrl = (key) => {
    if (process.env.RESUME_S3_PUBLIC_BASE_URL) {
        return `${process.env.RESUME_S3_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`;
    }

    return `https://${resumeBucket}.s3.${awsRegion}.amazonaws.com/${key}`;
};

const uploadResumeToS3 = async ({ buffer, originalName, mimeType }) => {
    if (!resumeBucket) {
        throw new Error("RESUME_S3_BUCKET is required when RESUME_STORAGE=s3");
    }

    const key = buildResumeKey(originalName);

    await getS3Client().send(
        new PutObjectCommand({
            Bucket: resumeBucket,
            Key: key,
            Body: buffer,
            ContentType: mimeType || "application/pdf"
        })
    );

    return {
        key,
        url: buildPublicUrl(key),
        s3Uri: `s3://${resumeBucket}/${key}`
    };
};

module.exports = {
    uploadResumeToS3
};
