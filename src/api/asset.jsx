// src/api/asset.js
import { api } from "./client";

/** Check if URL is already absolute (Cloudinary, external, etc.) */
function isAbsoluteUrl(url) {
  if (!url) return false;
  const s = String(url).trim();
  return s.startsWith('http://') || s.startsWith('https://');
}

/**
 * Inject Cloudinary transformation params into a Cloudinary URL.
 * - "hero"  → w_1200, for full-width banners
 * - "thumb" → w_400,  for product cards / thumbnails (fits 375px mobile)
 * - default → w_1200  (safe for most uses)
 *
 * f_webp  = FORCE WebP format (not f_auto which may fall back to JPG)
 * q_auto  = smart quality compression (~70-80%)
 * c_limit = only shrink, never upscale
 */
function optimizeCloudinaryUrl(url, size = "default") {
  if (!url || !url.includes("res.cloudinary.com")) return url;

  const w = size === "thumb" ? "w_300" : "w_1200";
  const transforms = `f_webp,q_auto,${w},c_limit`;

  // Avoid double-injecting transforms
  if (url.includes("f_webp") || url.includes("f_auto") || url.includes("q_auto")) return url;

  return url.replace("/upload/", `/upload/${transforms}/`);
}

export function toRelativeFromPublic(input) {
  if (!input) return "";
  const s = String(input).trim();

  // If it's an absolute URL (Cloudinary), return as-is
  if (isAbsoluteUrl(s)) return s;

  // For local paths, extract relative portion
  const idx = s.indexOf("/public");
  return idx >= 0 ? s.slice(idx) : s.startsWith("/") ? s : `/${s.replace(/^\/?/, "")}`;
}

/**
 * Build a full img URL from a stored path.
 * @param {string} relativePath - stored image path or absolute URL
 * @param {"default"|"thumb"|"hero"} size - controls Cloudinary resize width
 */
export function assetUrl(relativePath, size = "default") {
  if (!relativePath) return "";

  const s = String(relativePath).trim();

  // Cloudinary URL → inject optimization transforms
  if (isAbsoluteUrl(s)) {
    return optimizeCloudinaryUrl(s, size);
  }

  // For local relative paths, build full URL
  const rel = toRelativeFromPublic(s);

  // Derive origin from axios base (remove trailing "/api")
  let base = api.defaults.baseURL || "";
  base = String(base).replace(/\/+$/, "");
  const apiIdx = base.toLowerCase().lastIndexOf("/api");
  const origin = apiIdx === -1 ? base : base.slice(0, apiIdx);

  return `${origin}${rel}`;
}