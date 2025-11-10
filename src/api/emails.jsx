import { api } from "./client";

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("admin_jwt") || ""}` },
});

const noCache = {
  headers: { "Cache-Control": "no-cache" },
  params: { _: Date.now() },
};

export const EmailAPI = {
  // TEMPLATES
  listTemplates: () => api.get("/admin/email-templates", { ...noCache, ...auth() }),
  createTemplate: (payload) => api.post("/admin/email-templates", payload, auth()),
  updateTemplate: (idOrSlug, payload) =>
    api.patch(`/admin/email-templates/${idOrSlug}`, payload, auth()),
  deleteTemplate: (idOrSlug) =>
    api.delete(`/admin/email-templates/${idOrSlug}`, auth()),
  testTemplate: (slug, body) =>
    api.post(`/admin/email-templates/test/${slug}`, body, auth()),
  
  // SENDERS
  listSenders: () => api.get("/admin/mail-senders", { ...noCache, ...auth() }),
  createSender: (payload) => api.post("/admin/mail-senders", payload, auth()),
  updateSender: (id, payload) => api.put(`/admin/mail-senders/${id}`, payload, auth()),
  deleteSender: (id) => api.delete(`/admin/mail-senders/${id}`, auth()),
  testSender: (id, body) => api.post(`/admin/mail-senders/${id}/test`, body, auth()),
};
