const { spawn, spawnSync } = require("node:child_process");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..", "..");
const command = process.env.ComSpec || "C:\\Windows\\System32\\cmd.exe";

const child = spawn(command, ["/d", "/s", "/c", "npm start"], {
  cwd: projectRoot,
  env: process.env,
  windowsHide: true,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error("Failed to start BalhinBalay Site:", error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`BalhinBalay Site exited via signal ${signal}`);
    process.exit(1);
  }

  process.exit(code ?? 1);
});

let stopping = false;

function stopChild() {
  if (stopping || child.killed || !child.pid) {
    return;
  }

  stopping = true;

  if (process.platform === "win32") {
    spawnSync("taskkill.exe", ["/PID", String(child.pid), "/T", "/F"], {
      windowsHide: true,
      stdio: "ignore",
    });
  } else {
    child.kill("SIGTERM");
  }
}

process.on("SIGINT", stopChild);
process.on("SIGTERM", stopChild);
process.on("exit", stopChild);
