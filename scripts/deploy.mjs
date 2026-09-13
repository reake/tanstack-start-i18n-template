import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

/** @typedef {"pages" | "workers"} DeployTarget */

/**
 * Resolve the deployment target from an explicit argument or environment.
 * @param {string | undefined} envTarget
 * @param {string[]} args
 * @returns {DeployTarget}
 */
export function getDeployTarget(envTarget, args) {
  const requested = args[0] || envTarget || "pages";
  if (requested !== "pages" && requested !== "workers") {
    throw new Error("CF_DEPLOY_TARGET must be pages or workers.");
  }
  return requested;
}

/**
 * Build the Wrangler argument list for a deployment target.
 * @param {DeployTarget} target
 * @param {string | undefined} [pagesProject]
 */
export function getWranglerArgs(target, pagesProject) {
  if (target === "workers") {
    return ["deploy", "--config", "wrangler.workers.toml"];
  }

  const args = ["pages", "deploy", "dist"];
  if (pagesProject) args.push("--project-name", pagesProject);
  return args;
}

function run() {
  const [targetArg, ...wranglerArgs] = process.argv.slice(2);
  const target = getDeployTarget(
    process.env.CF_DEPLOY_TARGET,
    targetArg ? [targetArg] : [],
  );
  const args = [
    ...getWranglerArgs(target, process.env.CF_PAGES_PROJECT_NAME),
    ...wranglerArgs,
  ];

  console.log(`[deploy] Building for Cloudflare ${target}...`);
  const build = spawn("pnpm", ["build"], {
    env: { ...process.env, CF_DEPLOY_TARGET: target },
    stdio: "inherit",
    shell: false,
  });
  build.on("exit", (buildCode, buildSignal) => {
    if (buildSignal) process.kill(process.pid, buildSignal);
    if (buildCode !== 0) process.exit(buildCode ?? 1);

    console.log(`[deploy] Cloudflare ${target}: wrangler ${args.join(" ")}`);
    const deploy = spawn("pnpm", ["exec", "wrangler", ...args], {
      stdio: "inherit",
      shell: false,
    });
    deploy.on("exit", (deployCode, deploySignal) => {
      if (deploySignal) process.kill(process.pid, deploySignal);
      process.exit(deployCode ?? 1);
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run();
}
