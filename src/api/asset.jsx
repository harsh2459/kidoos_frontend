// src/api/assetUrl.js
import { api } from "../../api/client";

function apiOrigin() {
  // api.defaults.baseURL is like "https://kiddoos-backend.onrender.com/api"
  return (api.defaults.baseURL || "").replace(/\/+api\/?$/i, "");
}

export function assetUrl(u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u; // already absolute
  const origin = apiOrigin().replace(/\/+$/, "");
  const path = String(u).startsWith("/") ? u : `/${u}`;
  return `${origin}${path}`;
}

/** Extract "/public/..." from any absolute/relative URL */
export function toRelativeFromPublic(u) {
  if (!u) return u;
  const m = String(u).match(/\/public\/.+$/);
  return m ? m[0] : u; // if it doesn’t contain /public/, leave as-is
}
