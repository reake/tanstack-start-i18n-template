#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const skip = process.env.PREFLIGHT_SKIP === "1" && !process.env.CI;
const warningOnly = Boolean(process.env.CI) && process.env.PREFLIGHT_WARN_ONLY === "1";
const issues = [];
const read = (file) => readFile(path.join(root, file), "utf8");

const config = await read("src/site.config.ts");
if (/url:\s*["'][^"']*example\.com/i.test(config))
  issues.push("Replace example.com in src/site.config.ts url.");
if (/email:\s*["']hello@example\.com["']/i.test(config))
  issues.push("Replace hello@example.com in src/site.config.ts email.");
const defaults = {
  "public/logo.png": "881dbe1dba284d4f359f435ec9c430749a670961f67689ff49f486926558d8d4",
  "public/og-image.png":
    "c2ae6abf79ced369e87d6f775a9963f7dc6fd6b58426b2c722adb0ba9b3a2a94",
};
for (const [file, original] of Object.entries(defaults)) {
  try {
    const current = createHash("sha256")
      .update(await readFile(path.join(root, file)))
      .digest("hex");
    if (current === original)
      issues.push(`Replace ${file}; it still matches the repository placeholder hash.`);
  } catch {
    issues.push(`Missing ${file}.`);
  }
}
const notices = await read("THIRD_PARTY_NOTICES.md");
if (/verify|自行核实/i.test(notices))
  issues.push("Remove verify/自行核实 wording from THIRD_PARTY_NOTICES.md.");

if (skip) {
  console.warn("[preflight] skipped for local debugging (PREFLIGHT_SKIP=1).");
  process.exit(0);
}
if (issues.length === 0) {
  console.log(`[preflight] passed${warningOnly ? " (warning mode)" : ""}.`);
} else {
  for (const issue of issues)
    console[warningOnly ? "warn" : "error"](`[preflight] ${issue}`);
  if (!warningOnly) process.exitCode = 1;
}
