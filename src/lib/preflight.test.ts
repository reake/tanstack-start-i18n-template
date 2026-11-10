// @vitest-environment node
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, it } from "vitest";

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

it("checks distribution defaults and restricts bypasses to local debugging", () => {
  const root = mkdtempSync(path.join(tmpdir(), "preflight-"));
  roots.push(root);
  mkdirSync(path.join(root, "src"));
  mkdirSync(path.join(root, "public"));
  cpSync("src/site.config.ts", path.join(root, "src/site.config.ts"));
  cpSync("public/logo.png", path.join(root, "public/logo.png"));
  cpSync("public/og-image.png", path.join(root, "public/og-image.png"));
  cpSync("THIRD_PARTY_NOTICES.md", path.join(root, "THIRD_PARTY_NOTICES.md"));
  const run = (env: Record<string, string> = {}) =>
    spawnSync(process.execPath, [path.resolve("scripts/preflight.mjs")], {
      cwd: root,
      env: {
        ...process.env,
        CI: "",
        PREFLIGHT_SKIP: "",
        PREFLIGHT_WARN_ONLY: "",
        ...env,
      },
      encoding: "utf8",
    });
  expect(run().status).toBe(1);
  expect(run().stderr).toContain("public/logo.png");
  expect(run({ PREFLIGHT_SKIP: "1" }).status).toBe(0);
  expect(run({ CI: "true", PREFLIGHT_SKIP: "1" }).status).toBe(1);
  expect(run({ CI: "true", PREFLIGHT_WARN_ONLY: "1" }).status).toBe(0);
  writeFileSync(
    path.join(root, "src/site.config.ts"),
    'url: "https://site.test", email: "hi@site.test"',
  );
  writeFileSync(path.join(root, "public/logo.png"), "replacement logo");
  writeFileSync(path.join(root, "public/og-image.png"), "replacement image");
  expect(run().status).toBe(0);
  writeFileSync(path.join(root, "THIRD_PARTY_NOTICES.md"), "verify");
  expect(run().status).toBe(1);
});
