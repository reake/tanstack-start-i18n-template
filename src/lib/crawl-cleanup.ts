import { isInternalRouteTemplatePath } from "~/lib/route-template-path";

function safeDecodePathname(pathname: string): string {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

function gone(): Response {
  return new Response("Gone", {
    status: 410,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

export function cleanupInternalRouteTemplateRequest(request: Request): Response | null {
  if (request.method !== "GET" && request.method !== "HEAD") return null;

  const url = new URL(request.url);
  const pathname = safeDecodePathname(url.pathname);

  return isInternalRouteTemplatePath(pathname) ? gone() : null;
}

export function withNoindexForNotFound(response: Response): Response {
  if (response.status !== 404) return response;

  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", "noindex, follow");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
