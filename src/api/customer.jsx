import { api } from "./client";

export const CustomerAPI = {
  async register(payload) {
    return api.post("/customer/auth/register", payload);
  },
  
  async login(payload) {
    return api.post("/customer/auth/login", payload);
  },
  
  async me(token) {
    return api.get("/customer/me", { meta: { auth: "customer" } });
  },
  
  async updateProfile(token, patch) {
    return api.patch("/customer/me", patch, { meta: { auth: "customer" } });
  },
  
  async getCart(token) {
    return api.get("/customer/cart", { meta: { auth: "customer" } });
  },
  
  async addToCart(token, { bookId, qty }) {
    return api.post(
      "/customer/cart/add", 
      { bookId, qty }, 
      { meta: { auth: "customer" } }
    );
  },
  
  async setCartQty(token, { itemId, qty }) {
    return api.patch(
      "/customer/cart/qty",
      { itemId, qty },
      { meta: { auth: "customer" } }
    );
  },
  
  async removeCartItem(token, itemId) {
    return api.delete(
      `/customer/cart/item/${itemId}`, 
      { meta: { auth: "customer" } }
    );
  },
  
  async clearCart(token) {
    return api.delete("/customer/cart/clear", { meta: { auth: "customer" } });
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