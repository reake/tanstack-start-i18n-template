# TanStack Start 多语言 SEO 模板

[English](./README.md) · 中文说明

一个面向内容型网站的 TanStack Start 起步模板：从一开始就把多语言路由、SEO 元数据、MDX 内容和 Cloudflare 部署放进同一套架构。

## 为什么使用这个模板？

多数 TanStack Start 示例主要展示框架能力；这个模板更适合需要自然搜索流量的多语言内容站点。路由、内容、元数据、语言互链以及 sitemap 使用同一套 locale-aware 原语，减少后期补国际化和 SEO 时的返工。

## 功能概览

### 国际化

- 使用可选的 `{-$locale}` 路由片段
- 默认语言英文不带前缀：`/blog`；中文使用 `/zh/blog`
- 消息目录按语言懒加载，并以英文作为缺失文案的兜底
- 自动生成语言切换器、`hreflang` 和 `x-default`

### 内容与 SEO

- 使用带 front matter 校验的多语言 MDX 博客
- 提供 canonical、Open Graph、Twitter Card 和 JSON-LD 工具
- 构建时生成 `sitemap.xml` 与 `robots.txt`

### 开发体验

- TypeScript、类型安全的 TanStack Router、React 和 Tailwind CSS
- 可复用且可访问的 UI 基础组件
- 支持 Cloudflare Pages 和 Workers 两种部署目标

## 项目结构

```text
content/blogs/          MDX 文章，每种语言一个文件
public/                 静态资源及生成的 sitemap/robots 文件
scripts/                博客、sitemap 和部署脚本
src/routes/             TanStack Start 文件路由
src/components/         布局、落地页、博客、法律页面和 UI 组件
src/messages/<locale>/  JSON 消息目录
src/lib/                i18n、SEO、博客和请求工具
src/site.config.ts      站点名称、域名和 SEO 身份信息
src/router.tsx          Router 配置
```

重点不是“把文字翻译成另一种语言”，而是让路由、内容、元数据、alternate 链接和搜索引擎发现文件保持一致。

## 快速开始

要求：Node.js 20+、pnpm 10.10.0。仓库通过 `packageManager` 固定 pnpm 版本，建议使用 Corepack：

```bash
corepack enable
corepack prepare pnpm@10.10.0 --activate
pnpm install --frozen-lockfile
pnpm dev                 # http://localhost:3000
```

本地开发不需要环境变量。`.env.example` 只记录可选的部署和 sitemap 配置；部署脚本不会自动加载 `.env`，请在 shell 或 CI 中导出需要的变量。

> 工具链提示：当前模板使用与 TanStack Start 兼容的 Vite beta 版本，以及固定的 Nitro nightly 构建。升级任一依赖前，请先确认 lockfile 并运行完整检查；待 TanStack Start 的兼容窗口允许后，再迁移到稳定版本。

## 配置站点

部署前先修改 [`src/site.config.ts`](./src/site.config.ts)：

```ts
export const siteConfig = {
  name: "Your Product",
  url: "https://your-domain.com",
  email: "hello@your-domain.com",
  // description, logo, and ogImage
} as const;
```

其中 `url` 会用于 canonical URL、JSON-LD、sitemap 和 `robots.txt`。同时替换 `public/` 中的 `logo.png`、`og-image.png` 和 `favicon.ico`，并确认这些资源的授权。仓库内置字体的授权信息见 [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md)。

## 新增语言

语言由 `src/messages/*/common.json` 自动发现：

1. 复制 `src/messages/en/` 到 `src/messages/<locale>/` 并翻译 JSON 值。
2. 在 [`src/lib/i18n.ts`](./src/lib/i18n.ts) 的 `NATIVE_LANGUAGE_LABELS` 中加入该语言的本地名称。
3. 在 [`src/lib/seo.ts`](./src/lib/seo.ts) 的 `OG_LOCALE_BY_LOCALE` 中加入 Open Graph locale。

路由、语言切换器、`hreflang` 和 sitemap 会自动更新。默认语言 `en` 永远不加前缀；生成链接时请使用 `withLocalePath`，不要手写 locale URL。

| URL        | 含义                |
| ---------- | ------------------- |
| `/blog`    | 英文（默认语言）    |
| `/zh/blog` | 中文                |
| `/en/blog` | 重定向到 `/blog`    |
| `/unknown` | 带 `noindex` 的 404 |

所有用户可见文案都应放在 `src/messages`。新增 JSON 命名空间前，先把它加入 `MESSAGE_NAMESPACES`。

## 编写博客

在 `content/blogs/` 中为每种语言并排创建文章：

```text
getting-started.en.mdx
getting-started.zh.mdx
```

两份文件共享 `getting-started` slug，并会互相生成语言 alternate。front matter 支持 `title`、`description`、`date`、可选的 `updated`、`tags`、`author` 和 `cover`：

```mdx
---
title: "开始使用"
description: "用于搜索结果和社交卡片的摘要。"
date: "2026-01-12"
tags: ["上手", "i18n"]
---
```

博客 MDX 属于受信任的仓库内容，会作为代码编译。不要直接把用户提交内容接入这条流水线，除非先增加 sanitizer 和白名单组件集合。

## 常用命令

| 命令                      | 用途                               |
| ------------------------- | ---------------------------------- |
| `pnpm dev`                | 启动 Vite 开发服务器               |
| `pnpm build`              | 生成 sitemap/robots 并构建生产版本 |
| `pnpm test`               | 运行 Vitest                        |
| `pnpm check`              | 检查格式、lint 和 TypeScript       |
| `pnpm sitemap:generate`   | 重新生成 sitemap 和 robots         |
| `pnpm run deploy:pages`   | 构建并部署 Cloudflare Pages        |
| `pnpm run deploy:workers` | 构建并部署 Cloudflare Workers      |

## 部署

Cloudflare Pages 是默认目标：

```bash
pnpm exec wrangler login
CF_PAGES_PROJECT_NAME=your-project pnpm run deploy
```

首次部署 Pages 时通常需要 `CF_PAGES_PROJECT_NAME`，除非已在 shell 或 CI 中配置。Workers 部署使用 [`wrangler.workers.toml`](./wrangler.workers.toml)，并要求账号中已经配置对应 Worker。Pages 输出到 `dist/`，Workers 输出到 `.output/`。

发布前建议依次运行 `pnpm check`、`pnpm test` 和 `pnpm build`。构建会重新生成 sitemap、robots 和类型化博客模块，请不要手动编辑这些生成文件。部署后把 `/sitemap.xml` 提交到 Search Console，并检查本地化页面的 canonical、`hreflang` 和 JSON-LD。

## 贡献与许可

提交前请阅读 [`CONTRIBUTING.md`](./CONTRIBUTING.md)。仓库的开发约定见 [`AGENTS.md`](./AGENTS.md)，AI/编辑器辅助约定见 [`CLAUDE.md`](./CLAUDE.md)。安全问题请按 [`SECURITY.md`](./SECURITY.md) 的私密披露流程处理。

本模板采用 [MIT License](./LICENSE)，可按许可证条款用于商业项目。示例项目为 [SVGView](https://svgview.com)。

作者：[reake](https://x.com/reakecom)
