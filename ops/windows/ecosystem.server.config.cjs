const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..", "..");
const configDir = path.join(os.homedir(), ".balhinbalay");
const envFile = path.join(configDir, "production.env");
const logsDir = path.join(configDir, "logs");

if (!fs.existsSync(envFile)) {
  throw new Error(`Missing machine-local production environment file: ${envFile}`);
}

fs.mkdirSync(logsDir, { recursive: true });

const config = {};
const contents = fs.readFileSync(envFile, "utf8").replace(/^\uFEFF/, "");

for (const rawLine of contents.split(/\r?\n/)) {
  const line = rawLine.trim();

  if (!line || line.startsWith("#")) {
    continue;
  }

  const separator = line.indexOf("=");

  if (separator < 1) {
    continue;
  }

  const key = line.slice(0, separator).trim();
  const value = line.slice(separator + 1);
  config[key] = value;
}

const required = [
  "DATABASE_URL",
  "APP_URL",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
  "PROXY_KEY",
  "ADMIN_EMAILS",
  "ACCOUNT_API_ORIGIN",
  "ACCOUNT_PROXY_KEY",
  "ACCOUNT_ALLOW_LOCAL_HTTP",
];

for (const key of required) {
  if (!config[key]) {
    throw new Error(`Missing required BalhinBalay production setting: ${key}`);
  }
}

module.exports = {
  apps: [
    {
      name: "balhinbalay-account",
      cwd: path.join(projectRoot, "account-service"),
      script: path.join(projectRoot, "account-service", "src", "server.js"),
      interpreter: process.execPath,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      restart_delay: 3000,
      kill_timeout: 5000,
      windowsHide: true,
      out_file: path.join(logsDir, "account-out.log"),
      error_file: path.join(logsDir, "account-error.log"),
      env: {
        NODE_ENV: "production",
        DATABASE_URL: config.DATABASE_URL,
        APP_URL: config.APP_URL,
        SMTP_HOST: config.SMTP_HOST,
        SMTP_PORT: config.SMTP_PORT,
        SMTP_SECURE: config.SMTP_SECURE,
        SMTP_USER: config.SMTP_USER,
        SMTP_PASS: config.SMTP_PASS,
        SMTP_FROM: config.SMTP_FROM,
        PROXY_KEY: config.PROXY_KEY,
        ADMIN_EMAILS: config.ADMIN_EMAILS,
        HOST: "127.0.0.1",
        PORT: "5000",
      },
    },
    {
      name: "balhinbalay-site",
      cwd: projectRoot,
      script: path.join(projectRoot, "ops", "windows", "site-runner.cjs"),
      interpreter: process.execPath,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      restart_delay: 3000,
      kill_timeout: 8000,
      windowsHide: true,
      out_file: path.join(logsDir, "site-out.log"),
      error_file: path.join(logsDir, "site-error.log"),
      env: {
        NODE_ENV: "production",
        APP_URL: config.APP_URL,
        ACCOUNT_API_ORIGIN: config.ACCOUNT_API_ORIGIN,
        ACCOUNT_PROXY_KEY: config.ACCOUNT_PROXY_KEY,
        ACCOUNT_ALLOW_LOCAL_HTTP: config.ACCOUNT_ALLOW_LOCAL_HTTP,
      },
    },
  ],
};
