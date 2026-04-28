const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const awsRegion = process.env.SES_REGION || process.env.AWS_REGION || "us-east-1";
const fromEmail = process.env.SES_FROM_EMAIL;

let sesClient;

const getSesClient = () => {
    if (!sesClient) {
        sesClient = new SESClient({ region: awsRegion });
    }

    return sesClient;
};

const canSendEmail = () => Boolean(fromEmail);

const sendCandidateSelectedEmail = async ({
    toEmail,
    candidateName,
    jobTitle,
    company
}) => {
    if (!canSendEmail()) {
        return;
    }

    if (!toEmail) {
        return;
    }

    const safeCandidateName = candidateName || "there";
    const safeJobTitle = jobTitle || "the role";
    const safeCompany = company || "ApplyVault";

    const subject = `ApplyVault: You’ve been selected for ${safeJobTitle}`;
    const bodyText =
        `Hi ${safeCandidateName},\n\n` +
        `Good news — you’ve been selected for ${safeJobTitle} at ${safeCompany}.\n\n` +
        `Please check the portal for next steps.\n\n` +
        `Thanks,\n` +
        `ApplyVault`;

    await getSesClient().send(
        new SendEmailCommand({
            Source: fromEmail,
            Destination: {
                ToAddresses: [toEmail]
            },
            Message: {
                Subject: {
                    Data: subject
                },
                Body: {
                    Text: {
                        Data: bodyText
                    }
                }
            }
        })
    );
};

module.exports = {
    canSendEmail,
    sendCandidateSelectedEmail
};
