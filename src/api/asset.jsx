// src/api/asset.js
import { prodErrorMap } from "firebase/auth";
import { api } from "./client";

/** Check if URL is already absolute (Cloudinary, external, etc.) */
function isAbsoluteUrl(url) {
  if (!url) return false;
  const s = String(url).trim();
  return s.startsWith('http://') || s.startsWith('https://');
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

/** Build a full img URL from a stored path */
export function assetUrl(relativePath) {
  if (!relativePath) return "";
  
  const s = String(relativePath).trim();
  
  // ✅ If already absolute (Cloudinary URL), return as-is
  if (isAbsoluteUrl(s)) {
    return s;
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