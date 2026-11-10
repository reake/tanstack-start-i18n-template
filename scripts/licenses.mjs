#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { format } from "prettier";

const root = process.cwd();
const lock = await readFile(path.join(root, "pnpm-lock.yaml"), "utf8");
const manifest = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const names = [...Object.keys(manifest.dependencies), "tailwindcss"].sort();
const importer = lock.split("\n    devDependencies:")[0];
const lines = [
  "# Direct dependency licenses",
  "",
  "Generated from the lockfile and installed package metadata. Transitive dependencies are not included.",
  "",
  "| Package | Version | License |",
  "| --- | --- | --- |",
];
for (const name of names) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const section =
    name === "tailwindcss" ? lock.split("\n    devDependencies:")[1] : importer;
  const version = section?.match(
    new RegExp(
      `\\n      ['"]?${escaped}['"]?:\\n        specifier: [^\\n]+\\n        version: ([^\\s(]+)`,
    ),
  )?.[1];
  if (!version) throw new Error(`No locked version for ${name}`);
  const metadata = JSON.parse(
    await readFile(path.join(root, "node_modules", name, "package.json"), "utf8"),
  );
  if (metadata.version !== version)
    throw new Error(
      `Installed ${name} does not match lockfile; run pnpm install --frozen-lockfile`,
    );
  let license = metadata.license;
  if (typeof license !== "string") {
    const text = await readFile(
      path.join(root, "node_modules", name, "LICENSE"),
      "utf8",
    ).catch(() => "");
    license = text.startsWith("MIT License") ? "MIT" : "Unknown";
  }
  lines.push(`| ${name} | ${version} | ${license} |`);
}
await mkdir(path.join(root, "LICENSES"), { recursive: true });
await writeFile(
  path.join(root, "LICENSES/third-party.md"),
  await format(`${lines.join("\n")}\n`, { parser: "markdown" }),
);
console.log("[licenses] LICENSES/third-party.md generated");
