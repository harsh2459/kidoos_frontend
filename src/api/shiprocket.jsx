// src/api/shiprocket.jsx
import { api } from "./client";

export const ShipAPI = {
  /**
   * Phase 1: Create Shiprocket orders for selected orderIds.
   * Returns { data: { ready: [{ id, shipmentId, couriers: [], recommendedCourierId }], failed, noCourierAvailable } }
   * Admin must then pick a courier from `couriers` for each order.
   */
  create: (orderIds, dimensions, auth) =>
    api.post("/shiprocket/orders/create", { orderIds, dimensions }, auth),

  /**
   * Phase 2: Admin has chosen a courier. Assign AWB, generate label, schedule pickup.
   * selections = [{ orderId, courierId }]
   * Returns { data: { success: [...], failed: [...] } }
   */
  assignCourier: (selections, auth) =>
    api.post("/shiprocket/orders/assign-courier", { selections }, auth),

  /** Re-fetch courier options for an order that has shipmentId but no saved couriers */
  fetchCouriers: (orderId, auth) =>
    api.post("/shiprocket/orders/fetch-couriers", { orderId }, auth),

  label: (orderIds, auth) =>
    api.post("/shiprocket/label", { orderIds }, auth),

  manifest: (orderIds, auth) =>
    api.post("/shiprocket/manifest", { orderIds }, auth),

  track: (awb, auth) =>
    api.get(`/shiprocket/track/awb/${awb}`, auth),

  cancel: (shipment_id, auth) =>
    api.post("/shiprocket/cancel", { shipment_id }, auth),
};
