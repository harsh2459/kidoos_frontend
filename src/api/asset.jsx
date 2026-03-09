// src/api/asset.js
import { api } from "./client";

function isAbsoluteUrl(url) {
  if (!url) return false;
  const s = String(url).trim();
  return s.startsWith('http://') || s.startsWith('https://');
}

/**
 * If the stored value is an absolute URL (Cloudflare R2, or any CDN) return as-is.
 * If it's a local relative path, extract the /public/... portion.
 */
export function toRelativeFromPublic(input) {
  if (!input) return "";
  const s = String(input).trim();

  // Absolute URL (R2, external CDN) → keep as-is
  if (isAbsoluteUrl(s)) return s;

  // Local paths → extract relative portion
  const idx = s.indexOf("/public");
  return idx >= 0 ? s.slice(idx) : s.startsWith("/") ? s : `/${s.replace(/^\/?/, "")}`;
}

/**
 * Build a full img URL from a stored path.
 * - Absolute URLs (Cloudflare R2 / CDN) are returned as-is.
 * - Relative paths are resolved against the backend origin.
 * `size` param is accepted for backwards compatibility but unused (R2 has no URL transforms).
 */
// eslint-disable-next-line no-unused-vars
export function assetUrl(relativePath, size = "default") {
  if (!relativePath) return "";

  const s = String(relativePath).trim();

  // R2 / CDN absolute URL → return directly
  if (isAbsoluteUrl(s)) return s;

  // Local relative path → build full URL from backend origin
  const rel = toRelativeFromPublic(s);
  let base = api.defaults.baseURL || "";
  base = String(base).replace(/\/+$/, "");
  const apiIdx = base.toLowerCase().lastIndexOf("/api");
  const origin = apiIdx === -1 ? base : base.slice(0, apiIdx);

  return `${origin}${rel}`;
}
