// src/api/bluedart.jsx - FIXED endpoint paths
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
  // Create single shipment
  createShipment: (orderId, profileId, auth) =>
    handleApiCall(() =>
      api.post("/bluedart/shipment/create", { orderId, profileId }, auth)
    ),

  // Create multiple shipments (BULK)
  createShipments: (orderIds, profileId, customDetails = {}, auth) =>
    handleApiCall(() =>
      api.post("/bluedart/shipment/bulk-create", { orderIds, profileId, ...customDetails }, auth)
    ),

  // Track shipment by AWB number
  trackAwb: (awbNo, auth) =>
    handleApiCall(() =>
      api.get(`/bluedart/shipment/track/${awbNo}`, auth)
    ),

  // Schedule pickup
  schedulePickup: (data, auth) =>
    handleApiCall(() =>
      api.post("/bluedart/pickup/schedule", data, auth)
    ),

  // Cancel pickup
  cancelPickup: (confirmationNumber, reason, orderIds, auth) =>
    handleApiCall(() =>
      api.post("/bluedart/pickup/cancel", { confirmationNumber, reason, orderIds }, auth)
    ),

  // Cancel shipment/waybill
  cancelShipment: (awbNumber, reason, orderId, auth) =>
    handleApiCall(() =>
      api.post("/bluedart/shipment/cancel", { awbNumber, reason, orderId }, auth)
    ),

  // Generate shipping label PDF (legacy - returns stored URL)
  generateLabel: (orderId, auth) =>
    handleApiCall(() =>
      api.post(`/labels/generate/${orderId}`, {}, auth)
    ),

  // On-demand label generation - returns base64 PDF
  generateLabelOnDemand: (orderId, auth) =>
    handleApiCall(() =>
      api.post(`/labels/on-demand/${orderId}`, {}, auth)
    ),

  // Bulk on-demand label generation - returns array of base64 PDFs
  bulkGenerateLabels: (orderIds, auth) =>
    handleApiCall(() =>
      api.post(`/labels/bulk-generate`, { orderIds }, auth)
    ),

  // Get download URL for label
  downloadLabel: (fileName) =>
    `/api/labels/download/${fileName}`,

  // Get label metadata
  getLabelInfo: (fileName, auth) =>
    handleApiCall(() =>
      api.get(`/labels/info/${fileName}`, auth)
    ),

  // Delete label file
  deleteLabel: (fileName, auth) =>
    handleApiCall(() =>
      api.delete(`/labels/${fileName}`, auth)
    ),

  // ✅ FIXED: List all BlueDart profiles - correct endpoint
  listProfiles: (auth) =>
    handleApiCall(() =>
      api.get("/bluedart-profiles", auth)
    ),

  // ✅ FIXED: Get single profile by ID
  getProfile: (id, auth) =>
    handleApiCall(() =>
      api.get(`/bluedart-profiles/${id}`, auth)
    ),

  // ✅ FIXED: Create or update profile
  saveProfile: (profile, auth) =>
    handleApiCall(() =>
      api.post("/bluedart-profiles", profile, auth)
    ),

  // ✅ FIXED: Delete profile
  deleteProfile: (id, auth) =>
    handleApiCall(() =>
      api.delete(`/bluedart-profiles/${id}`, auth)
    ),

  // Get orders ready for shipment
  getOrdersForShipment: (auth) =>
    handleApiCall(() =>
      api.get("/bluedart/orders-for-shipment", auth)
    ),

  // Check if pincode is serviceable
  checkPincode: (pincode, auth) =>
    handleApiCall(() =>
      api.get(`/bluedart/check-pincode/${pincode}`, auth)
    ),

  // Get estimated transit time
  getTransitTime: (fromPincode, toPincode, productCode, pickupDate, auth) =>
    handleApiCall(() =>
      api.get("/bluedart/transit-time", {
        params: { fromPincode, toPincode, productCode, pickupDate },
        ...auth
      })
    ),
};