const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const awsRegion = process.env.AWS_REGION || "us-east-1";
const topicArn = process.env.SNS_TOPIC_ARN;

let snsClient;

const getSnsClient = () => {
    if (!snsClient) {
        snsClient = new SNSClient({ region: awsRegion });
    }

    return snsClient;
};

const publishNotification = async ({ subject, message, attributes = {} }) => {
    if (!topicArn) {
        return;
    }

    const messageAttributes = Object.entries(attributes).reduce((acc, [key, value]) => {
        acc[key] = {
            DataType: "String",
            StringValue: String(value)
        };
        return acc;
    }, {});

    await getSnsClient().send(
        new PublishCommand({
            TopicArn: topicArn,
            Subject: subject,
            Message: message,
            MessageAttributes: messageAttributes
        })
    );
};

module.exports = {
    publishNotification
};
