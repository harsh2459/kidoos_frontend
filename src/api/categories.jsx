// src/api/categories.js
import { api } from "./client";

export const CategoriesAPI = {
  list() {
    return api.get("/books/categories", { meta: { auth: "admin" } });
  },

  create(data) {
    return api.post("/books/categories", data, { meta: { auth: "admin" } });
  },

  remove(id) {
    return api.delete(`/books/categories/${id}`, { meta: { auth: "admin" } });
  }
};
