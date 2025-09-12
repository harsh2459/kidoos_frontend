// Simple helper for customer endpoints
import { api } from "./client";

const AUTH_KEY = "customer_jwt";

export const CustomerAPI = {
  async register(payload) {
    return api.post("/customer/auth/register", payload);
  },
  async login(payload) {
    return api.post("/customer/auth/login", payload);
  },
  async me(token) {
    return api.get("/customer/me", token ? { headers: { Authorization: `Bearer ${token}` } } : {});
  },
  async updateProfile(token, patch) {
    return api.patch("/customer/me", patch, { headers: { Authorization: `Bearer ${token}` } });
  },
  async getCart(token) {
    return api.get("/customer/cart", { headers: { Authorization: `Bearer ${token}` } });
  },
};