import handler from "@tanstack/react-start/server-entry";
import {
  cleanupInternalRouteTemplateRequest,
  withNoindexForNotFound,
} from "~/lib/crawl-cleanup";

export default {
  async fetch(request: Request) {
    // Leaked TanStack Router template paths (e.g. /{-$locale}/...) get a 410.
    const cleanupResponse = cleanupInternalRouteTemplateRequest(request);
    if (cleanupResponse) return cleanupResponse;

    const response = await handler.fetch(request);
    return withNoindexForNotFound(response);
  },
};
