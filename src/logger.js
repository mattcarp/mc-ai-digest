import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "logs");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const file = path.join(dir, "digest.log");

function line(msg, lvl) {
  return `[${new Date().toISOString()}] [${lvl}] ${msg}`;
}

export function logInfo(msg) {
  const out = line(msg, "INFO");
  console.log(out);
  fs.appendFileSync(file, out + "\n");
}

export function logError(msg, err) {
  const out = line(msg, "ERROR");
  console.error(out, err || "");
  fs.appendFileSync(
    file,
    out + (err ? ` ${err.stack || err.message}` : "") + "\n"
  );
}
