require("dotenv").config();

const serverless = require("serverless-http");
const app = require("./app");
const { testConnection, DB_CLIENT, sqliteFilePath } = require("./config/db");

let startupPromise;

const rawStagePrefix = process.env.API_STAGE_PREFIX || "";
const normalizedStage = rawStagePrefix.replace(/^\/+|\/+$/g, "");
const basePath = normalizedStage ? `/${normalizedStage}` : undefined;

const initialize = async () => {
    if (!startupPromise) {
        startupPromise = (async () => {
            const dbDescription =
                DB_CLIENT === "sqlite"
                    ? `sqlite (${sqliteFilePath})`
                    : "mysql";
            console.log(`Lambda using database client: ${dbDescription}`);
            await testConnection();
        })();
    }

    return startupPromise;
};

const httpHandler = serverless(app, {
    basePath,
    request: (request, event) => {
        request.apiGatewayEvent = event;
    }
});

const stripStagePrefix = (event) => {
    const stage = event && event.requestContext && event.requestContext.stage;
    if (!stage || stage === "$default") {
        return event;
    }

    const stagePrefix = `/${stage}`;
    const pathKeys = ["rawPath", "path"];

    pathKeys.forEach((key) => {
        if (typeof event[key] === "string" && event[key].startsWith(`${stagePrefix}/`)) {
            event[key] = event[key].slice(stagePrefix.length);
        }
    });

    if (event.requestContext && event.requestContext.http) {
        const currentPath = event.requestContext.http.path;
        if (typeof currentPath === "string" && currentPath.startsWith(`${stagePrefix}/`)) {
            event.requestContext.http.path = currentPath.slice(stagePrefix.length);
        }
    }

    return event;
};

module.exports.handler = async (event, context) => {
    await initialize();
    const normalizedEvent = stripStagePrefix({ ...event });
    return httpHandler(normalizedEvent, context);
};
