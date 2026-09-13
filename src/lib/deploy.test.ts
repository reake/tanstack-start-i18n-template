import { describe, expect, it } from "vitest";

import { getDeployTarget, getWranglerArgs } from "../../scripts/deploy.mjs";

describe("deployment target selection", () => {
  it("defaults to Cloudflare Pages", () => {
    expect(getDeployTarget(undefined, [])).toBe("pages");
  });

  it("accepts an explicit target argument", () => {
    expect(getDeployTarget("pages", ["workers"])).toBe("workers");
  });

  it("rejects unsupported targets", () => {
    expect(() => getDeployTarget("pages", ["vercel"])).toThrow(
      /CF_DEPLOY_TARGET must be pages or workers/,
    );
  });
});

describe("wrangler deployment arguments", () => {
  it("builds Pages arguments with an optional project name", () => {
    expect(getWranglerArgs("pages", "my-pages")).toEqual([
      "pages",
      "deploy",
      "dist",
      "--project-name",
      "my-pages",
    ]);
  });

  it("builds Workers arguments from the dedicated config", () => {
    expect(getWranglerArgs("workers")).toEqual([
      "deploy",
      "--config",
      "wrangler.workers.toml",
    ]);
  });
});
