import { api } from "./client";

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
  async addToCart(token, { bookId, qty }) {
    return api.post("/customer/cart/add", { bookId, qty }, { headers: { Authorization: `Bearer ${token}` } });
  },
  async setCartQty(token, { itemId, qty }) {
    return api.patch(
      "/customer/cart/qty",
      { itemId, qty },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },
  async removeCartItem(token, itemId) {
    return api.delete(`/customer/cart/item/${itemId}`, { headers: { Authorization: `Bearer ${token}` } });
  },
  async clearCart(token) {
    return api.delete("/customer/cart/clear", { headers: { Authorization: `Bearer ${token}` } });
  },
};

export const CustomerOTPAPI = {
  start(email) {
    return api.post("/customer/auth/email-otp/start", { email });
  },
  verify(email, otp) {
    return api.post("/customer/auth/email-otp/verify", { email, otp });
  },
};
