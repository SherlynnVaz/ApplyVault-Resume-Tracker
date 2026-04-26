require("dotenv").config();

const net = require("net");
const app = require("./app");
const { testConnection, DB_CLIENT, sqliteFilePath } = require("./config/db");

const DEFAULT_PORT = 5000;
const configuredPort = Number(process.env.PORT || DEFAULT_PORT);
const isProduction = process.env.NODE_ENV === "production";
const requiresDbOnStartup = process.env.REQUIRE_DB_ON_STARTUP === "true" || isProduction;

const formatStartupError = (error) => {
  if (!error) {
    return "Unknown startup error";
  }

  if (error.message) {
    return error.message;
  }

  if (Array.isArray(error.errors) && error.errors.length > 0) {
    return error.errors
      .map((innerError) => innerError && innerError.message)
      .filter(Boolean)
      .join(" | ");
  }

  if (error.code) {
    return `${error.name || "Error"} (${error.code})`;
  }

  return String(error);
};

const logDatabaseError = (error) => {
  const baseMessage = formatStartupError(error);
  console.error(`Database connection failed: ${baseMessage}`);

  if (Array.isArray(error && error.errors) && error.errors.length > 0) {
    error.errors.forEach((innerError) => {
      const details = [
        innerError && innerError.code,
        innerError && innerError.address,
        innerError && innerError.port
      ]
        .filter(Boolean)
        .join(" ");

      if (details) {
        console.error(`Database detail: ${details}`);
      }
    });
  }
};

const canBindPort = (port) =>
  new Promise((resolve) => {
    const probeServer = net.createServer();

    probeServer.once("error", () => {
      resolve(false);
    });

    probeServer.once("listening", () => {
      probeServer.close(() => resolve(true));
    });

    probeServer.listen(port);
  });

const getStartupPort = async () => {
  const hasExplicitPort = Boolean(process.env.PORT);

  if (hasExplicitPort) {
    return configuredPort;
  }

  const maxFallbackTries = 25;
  for (let offset = 0; offset < maxFallbackTries; offset += 1) {
    const candidatePort = configuredPort + offset;
    const available = await canBindPort(candidatePort);

    if (available) {
      if (offset > 0) {
        console.warn(
          `Port ${configuredPort} is in use. Starting server on port ${candidatePort} instead.`
        );
      }
      return candidatePort;
    }
  }

  throw new Error(
    `No available port found between ${configuredPort} and ${configuredPort + maxFallbackTries - 1}`
  );
};

const listenOnPort = (port) =>
  new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      resolve(server);
    });

    server.once("error", (error) => {
      reject(error);
    });
  });

const startServer = async () => {
  try {
    const dbDescription =
      DB_CLIENT === "sqlite"
        ? `sqlite (${sqliteFilePath})`
        : "mysql";
    console.log(`Using database client: ${dbDescription}`);

    try {
      await testConnection();
      console.log("Database connection established");
    } catch (dbError) {
      logDatabaseError(dbError);

      if (requiresDbOnStartup) {
        console.error("Set REQUIRE_DB_ON_STARTUP=false to skip DB startup checks in development.");
        process.exit(1);
      }

      console.warn("Continuing startup without an active database connection.");
    }

    const startupPort = await getStartupPort();
    await listenOnPort(startupPort);
    console.log(`ApplyVault API running on port ${startupPort}`);
  } catch (error) {
    if (error && error.code === "EADDRINUSE" && process.env.PORT) {
      console.error(
        `Configured PORT ${configuredPort} is already in use. Choose another port in your environment.`
      );
      process.exit(1);
    }

    console.error(`Failed to start server: ${formatStartupError(error)}`);
    process.exit(1);
  }
};

startServer();
