// src/api/bluedart.jsx
import { api } from "./client";

const handleApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    return response;
  } catch (error) {
    console.error("BlueDart API Error:", error);
    if (error?.response?.status === 401) {
      throw new Error("Authentication failed. Please login again.");
    }
    if (error?.response?.status === 403) {
      throw new Error("Access denied. Admin privileges required.");
    }
    if (error?.response?.status === 404) {
      throw new Error("Resource not found.");
    }
    if (error?.response?.status >= 500) {
      throw new Error("Server error. Please try again later.");
    }
    throw new Error(error?.response?.data?.error || error?.message || "Operation failed");
  }
};

export const BlueDartAPI = {
  createShipments: (orderIds, profileId, auth) =>
    handleApiCall(() => api.post("/shipments/create", { orderIds, profileId }, auth)),
  
  trackAwb: (awb, auth) =>
    handleApiCall(() => api.get(`/shipments/track/${awb}`, auth)),
  
  schedulePickup: (orderIds, pickupDate, pickupAddress, auth) =>
    handleApiCall(() => api.post("/shipments/pickup", { orderIds, pickupDate, pickupAddress }, auth)),
  
  cancelShipment: (orderIds, auth) =>
    handleApiCall(() => api.post("/shipments/cancel", { orderIds }, auth)),
  
  listProfiles: (auth) =>
    handleApiCall(() => api.get("/bluedart-profile", auth)),
  
  getProfile: (id, auth) =>
    handleApiCall(() => api.get(`/bluedart-profile/${id}`, auth)),
  
  saveProfile: (profile, auth) =>
    handleApiCall(() => api.post("/bluedart-profile", profile, auth)),
  
  deleteProfile: (id, auth) =>
    handleApiCall(() => api.delete(`/bluedart-profile/${id}`, auth)),
};
