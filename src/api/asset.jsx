import { api } from "./client";
const base = api.defaults.baseURL || "";
const API_ORIGIN = base.startsWith("http") ? base.replace(/\/api\/?$/, "") : window.location.origin;
export function assetUrl(u) { return !u ? "" : /^https?:\/\//i.test(u) ? u : `${API_ORIGIN}${u}`; }
