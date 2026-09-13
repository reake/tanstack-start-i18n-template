export const INTERNAL_ROUTE_TEMPLATE_MARKERS = [
  "{-$locale}",
  "/-$locale",
  "(pages)",
  "(tools)",
  "$slug",
  "/undefined",
] as const;

export function isInternalRouteTemplatePath(pathname: string): boolean {
  return INTERNAL_ROUTE_TEMPLATE_MARKERS.some((marker) => pathname.includes(marker));
}
