// src/api/bluedart.jsx
import { api } from "./client";

// Enhanced error handling wrapper
const handleApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    return response;
  } catch (error) {
    console.error("BlueDart API Error:", error); // Fixed: console.error not console.err
    
    // Handle specific error cases
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
    
    // Default error
    throw new Error(error?.response?.data?.error || error?.message || "Operation failed");
  }
};

export const BlueDartAPI = {
  // Create shipments for orders
  createShipments: (orderIds, profileId, auth) =>
    handleApiCall(() => api.post("/bluedart/orders/create", { orderIds, profileId }, auth)),

  // Track AWB
  trackAwb: (awb, auth) =>
    handleApiCall(() => api.get(`/bluedart/track/${awb}`, auth)),

  // Schedule pickup
  schedulePickup: (orderIds, pickupDate, pickupAddress, auth) =>
    handleApiCall(() => api.post("/bluedart/pickup", { orderIds, pickupDate, pickupAddress }, auth)),

  // Cancel shipment
  cancelShipment: (orderIds, auth) =>
    handleApiCall(() => api.post("/bluedart/cancel", { orderIds }, auth)),

  // Profile management
  listProfiles: (auth) =>
    handleApiCall(() => api.get("/bluedart-profiles", auth)),

  getProfile: (id, auth) =>
    handleApiCall(() => api.get(`/bluedart-profiles/${id}`, auth)),

  saveProfile: (profile, auth) =>
    handleApiCall(() => api.post("/bluedart-profiles", profile, auth)),

  deleteProfile: (id, auth) =>
    handleApiCall(() => api.delete(`/bluedart-profiles/${id}`, auth)),
};
