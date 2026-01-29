// src/api/shiprocket.jsx
import { api } from "./client";

export const ShipAPI = {
  // ✅ WORKS - Backend exists
  create: (orderIds, auth) => 
    api.post("/shiprocket/orders/create", { orderIds }, auth),
  
  // ✅ NOW WORKS - Backend added above
  label: (orderIds, auth) => 
    api.post("/shiprocket/label", { orderIds }, auth),
  
  // ✅ NOW WORKS - Backend added above
  manifest: (orderIds, auth) => 
    api.post("/shiprocket/manifest", { orderIds }, auth),
  
  // ✅ NOW WORKS - Backend added above
  track: (awb, auth) => 
    api.get(`/shiprocket/track/awb/${awb}`, auth),
  
  // Other methods (implement if needed)
  invoice: (orderIds, auth) => 
    api.post("/shiprocket/invoice", { orderIds }, auth),
  
  assignAwb: (orderIds, courier_id, auth) => 
    api.post("/shiprocket/assign-awb", { orderIds, courier_id }, auth),
  
  pickup: (orderIds, pickup_date, auth) => 
    api.post("/shiprocket/pickup", { orderIds, pickup_date }, auth),
  
  cancel: (shipment_id, auth) => 
    api.post("/shiprocket/cancel", { shipment_id }, auth),
};
