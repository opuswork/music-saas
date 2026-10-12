/**
 * Base URL for browser calls to the Nest API (no `/api` path segment in env = we append `/api`).
 * Set `NEXT_PUBLIC_LESSONS_API_BASE_URL` to e.g. `http://127.0.0.1:4000` for local dev.
 */
export function getLessonsApiBaseForClient(): string {
  const raw =
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_LESSONS_API_BASE_URL?.replace(/\/$/, "")) ||
    "http://127.0.0.1:4000";
  return raw.endsWith("/api") ? raw : `${raw}/api`;
}

/** Server-side fetch (SSR / Route handlers): uses `LESSONS_API_BASE_URL`. */
export function getLessonsApiBaseForServer(): string {
  const raw =
    process.env.LESSONS_API_BASE_URL?.replace(/\/$/, "") ||
    "http://music-saas-api:4000";
  return raw.endsWith("/api") ? raw : `${raw}/api`;
}
