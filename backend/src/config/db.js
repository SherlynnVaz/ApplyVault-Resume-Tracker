const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const DB_CLIENT = (
  process.env.DB_CLIENT || (process.env.NODE_ENV === "production" ? "mysql" : "sqlite")
).toLowerCase();

const backendRoot = path.resolve(__dirname, "..", "..");
const configuredSqliteFile = process.env.SQLITE_FILE || "data/applyvault.sqlite";
const sqliteFilePath = path.isAbsolute(configuredSqliteFile)
  ? configuredSqliteFile
  : path.resolve(backendRoot, configuredSqliteFile);

const mysqlPool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const sqliteSchemaSql = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'candidate' CHECK (role IN ('candidate', 'recruiter', 'admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  job_id INTEGER NOT NULL,
  resume_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Shortlisted', 'Interview', 'Rejected', 'Selected')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, job_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS parsed_resumes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL UNIQUE,
  extracted_name TEXT,
  extracted_email TEXT,
  extracted_phone TEXT,
  skills TEXT,
  education TEXT,
  extracted_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_jobs_title_company ON jobs(title, company);
`;

const sqliteSeedUsersSql = `
INSERT OR IGNORE INTO users (name, email, password, role)
VALUES
  ('Recruiter One', 'recruiter@applyvault.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi0iFQH4fXg5lHppZArYrusS4x2rxy.', 'recruiter'),
  ('Admin User', 'admin@applyvault.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi0iFQH4fXg5lHppZArYrusS4x2rxy.', 'admin');
`;

const sqliteSeedJobsSql = `
INSERT INTO jobs (title, company, location, description)
VALUES
  ('Frontend Developer', 'NovaTech Labs', 'Bengaluru', 'Build modern React interfaces with API integrations and testing best practices.'),
  ('Backend Engineer', 'CloudBridge Systems', 'Hyderabad', 'Design scalable Node.js services, MySQL queries, and secure authentication flows.'),
  ('Data Analyst Intern', 'InsightFrame', 'Remote', 'Create reporting dashboards, SQL analyses, and automation scripts for hiring data.');
`;

let sqliteDatabasePromise;

let sqliteDependencies;
const getSqliteDependencies = () => {
  if (!sqliteDependencies) {
    const sqlite3 = require("sqlite3");
    const { open } = require("sqlite");
    sqliteDependencies = { sqlite3, open };
  }

  return sqliteDependencies;
};

const initializeSqliteDatabase = async () => {
  const { sqlite3, open } = getSqliteDependencies();

  fs.mkdirSync(path.dirname(sqliteFilePath), { recursive: true });

  const database = await open({
    filename: sqliteFilePath,
    driver: sqlite3.Database
  });

  await database.exec("PRAGMA foreign_keys = ON;");
  await database.exec(sqliteSchemaSql);
  await database.exec(sqliteSeedUsersSql);

  const jobCountRow = await database.get("SELECT COUNT(*) AS count FROM jobs");
  if (!jobCountRow || !jobCountRow.count) {
    await database.exec(sqliteSeedJobsSql);
  }

  return database;
};

const getSqliteDatabase = async () => {
  if (!sqliteDatabasePromise) {
    sqliteDatabasePromise = initializeSqliteDatabase();
  }

  return sqliteDatabasePromise;
};

const sqlitePool = {
  execute: async (sql, params = []) => {
    const database = await getSqliteDatabase();
    const normalizedSql = sql.trim().toUpperCase();

    if (normalizedSql.startsWith("SELECT") || normalizedSql.startsWith("PRAGMA")) {
      const rows = await database.all(sql, params);
      return [rows];
    }

    const result = await database.run(sql, params);
    return [
      {
        insertId: result.lastID,
        affectedRows: result.changes
      }
    ];
  },
  getConnection: async () => ({
    release: () => { }
  })
};

const pool = DB_CLIENT === "sqlite" ? sqlitePool : mysqlPool;

const testConnection = async () => {
  if (DB_CLIENT === "sqlite") {
    const database = await getSqliteDatabase();
    await database.get("SELECT 1 AS ok");
    return;
  }

  const connection = await mysqlPool.getConnection();
  connection.release();
};

module.exports = {
  pool,
  testConnection,
  DB_CLIENT,
  sqliteFilePath
};
