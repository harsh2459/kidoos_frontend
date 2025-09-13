// src/api/assetUrl.js
import { api } from "./client";

function getApiOrigin() {
  const base = api.defaults.baseURL || "";
  // base will be like "https://kiddoos-backend.onrender.com/api"
  // strip the trailing "/api"
  return base.replace(/\/+api\/?$/i, "");
}

export function assetUrl(u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;          // already absolute
  const origin = getApiOrigin().replace(/\/+$/, "");
  const path = String(u).startsWith("/") ? u : `/${u}`;
  return `${origin}${path}`;
}
