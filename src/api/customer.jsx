// Simple helper for customer endpoints
import { api } from "./client";

const AUTH_KEY = "customer_jwt";

export const CustomerAPI = {
  tokenKey: AUTH_KEY,

  setAuthHeader(token) {
    if (!token) return {};
    return { headers: { Authorization: `Bearer ${token}` } };
  },

  async register(payload) {
    // { name, email?, phone?, password }
    return api.post("/auth/register", payload);
  },

  async login(payload) {
    // { email?, phone?, password }  (backend accepts either email or phone + password)
    return api.post("/auth/login", payload);
  },

  async me(token) {
    return api.get("/me", CustomerAPI.setAuthHeader(token));
  },

  async updateProfile(token, patch) {
    return api.patch("/me", patch, CustomerAPI.setAuthHeader(token));
  },

  async getCart(token) {
    return api.get("/cart", CustomerAPI.setAuthHeader(token));
  },
};
