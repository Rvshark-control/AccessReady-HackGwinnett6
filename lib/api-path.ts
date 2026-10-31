// Next.js inlines NEXT_PUBLIC values at build time, matching its configured basePath.
export function apiPath(path: `/api/${string}`): string {
  return `${process.env.NEXT_PUBLIC_ACCESSREADY_BASE_PATH ?? ""}${path}`;
}
