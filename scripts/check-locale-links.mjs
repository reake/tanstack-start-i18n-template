#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const messages = path.join(root, "src/messages");
const localeEntries = await readdir(messages, { withFileTypes: true });
const locales = [];
for (const entry of localeEntries) {
  if (!entry.isDirectory() || entry.name === "en") continue;
  try {
    await readFile(path.join(messages, entry.name, "common.json"));
    locales.push(entry.name);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

const escaped = locales.map((locale) => locale.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
const pattern = new RegExp(
  `(?:["'\u0060(=]|https?://[^/\\s"']+)(/(${escaped.join("|")})(?:/|(?=["'\u0060?#)])))`,
  "g",
);
let failures = 0;
async function scan(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    // Generated code and tests contain intentional locale-path fixtures.
    if (entry.isDirectory()) {
      if (entry.name !== "generated") await scan(file);
    } else if (
      /\.(?:tsx?|jsx?|mdx|json)$/.test(file) &&
      !/\.(?:test|spec)\.[^.]+$/.test(file)
    ) {
      const source = await readFile(file, "utf8");
      if (file.endsWith("src/lib/i18n.ts") || file.endsWith("src/lib/seo.ts")) continue;
      // Inline code is documentation; Markdown links and JSX remain subject to the check.
      const searchable = file.endsWith(".mdx")
        ? source.replace(/`[^`\n]*`/g, (example) => " ".repeat(example.length))
        : source;
      for (const match of searchable.matchAll(pattern)) {
        const line = source.slice(0, match.index).split("\n").length;
        console.error(
          `${path.relative(root, file)}:${line}: hardcoded localized path ${match[1]}; use withLocalePath.`,
        );
        failures++;
      }
    }
  }
}
if (locales.length) {
  await scan(path.join(root, "src"));
  await scan(path.join(root, "content"));
}
if (failures) process.exitCode = 1;
else console.log("[locale-links] No hardcoded localized links found.");
