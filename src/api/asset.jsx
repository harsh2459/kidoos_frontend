// src/api/asset.js
import { api } from "./client";

/** If we get a full URL, reduce to "/public/..." . If already relative, keep it. */
export function toRelativeFromPublic(input) {
  if (!input) return "";
  const s = String(input);
  const idx = s.indexOf("/public/");
  return idx >= 0 ? s.slice(idx) : s.startsWith("/") ? s : `/public/${s.replace(/^public\/?/, "")}`;
}

/** Build a full img URL from a stored relative "/public/..." path */
export function assetUrl(relativePath) {
  const rel = toRelativeFromPublic(relativePath);
  // derive origin from axios base (remove trailing "/api")
  let base = api.defaults.baseURL || "";
  base = String(base).replace(/\/+$/, "");
  const apiIdx = base.toLowerCase().lastIndexOf("/api");
  const origin = apiIdx === -1 ? base : base.slice(0, apiIdx);
  return `${origin}${rel}`;
}
