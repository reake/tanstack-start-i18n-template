import contentCollections from "@content-collections/vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import { generateBlogData } from "./scripts/blog-data-generator.mjs";

const ssrSecurityHeaders = {
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};

const deployTarget = process.env.CF_DEPLOY_TARGET === "workers" ? "workers" : "pages";

/** Regenerate typed blog modules whenever MDX content changes. */
function blogDataPlugin() {
  return {
    name: "blog-data-generator",
    async buildStart() {
      await generateBlogData({ silent: true });
    },
    async handleHotUpdate(ctx: { file: string }) {
      if (!ctx.file.includes("/content/blogs/")) return;
      await generateBlogData({ silent: true });
    },
  };
}

export default defineConfig(({ command }) => ({
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom"],
  },
  plugins: [
    contentCollections(),
    blogDataPlugin(),
    tanstackStart(),
    // https://tanstack.com/start/latest/docs/framework/react/guide/hosting
    // Cloudflare presets are required for production output, but their local
    // worker emulator bypasses TanStack Start's Vite dev request handler.
    nitro(
      command === "build"
        ? {
            preset: deployTarget === "workers" ? "cloudflare-module" : "cloudflare-pages",
            routeRules: {
              "/**": { headers: ssrSecurityHeaders },
            },
            ...(deployTarget === "pages" && {
              cloudflare: {
                pages: {
                  routes: { exclude: ["/assets/*", "/fonts/*"] },
                },
              },
            }),
          }
        : undefined,
    ),
    viteReact({
      // https://react.dev/learn/react-compiler
      compiler: true,
    }),
    tailwindcss(),
  ],
}));
