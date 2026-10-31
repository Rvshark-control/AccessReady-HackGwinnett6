import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const port = Number(process.argv[2] ?? "3100");
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  console.error("Choose an available port from 1024 through 65535.");
  process.exit(1);
}
const projectDirectory = fileURLToPath(new URL("../", import.meta.url));
const nextCli = path.join(projectDirectory, "node_modules/next/dist/bin/next");
const previewEnvironment = { ...process.env, NEXT_PUBLIC_ACCESSREADY_BASE_PATH: `/ports/${port}/accessready-v2` };
let child;
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child?.kill(signal));
}
function run(args, executable = nextCli) {
  return new Promise((resolve, reject) => {
    child = spawn(process.execPath, [executable, ...args], {
      cwd: projectDirectory,
      env: previewEnvironment,
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`Next.js exited with code ${code}.`)));
  });
}
try {
  await run(["build", "--webpack"]);
  console.log(`\nOpen port ${port} in the workspace Ports panel. Preview path: ${previewEnvironment.NEXT_PUBLIC_ACCESSREADY_BASE_PATH}\n`);
  await run([String(port)], path.join(projectDirectory, "scripts/preview-server.mjs"));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
