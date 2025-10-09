import { api } from "./client";

export const ShipAPI = {
    label: (orderIds, auth) => api.post("/shiprocket/label", { orderIds }, auth), // returns { ok, data }
    invoice: (orderIds, auth) => api.post("/shiprocket/invoice", { orderIds }, auth),
    manifest: (orderIds, auth) => api.post("/shiprocket/manifest", { orderIds }, auth),
    create: (orderIds, auth) => api.post("/shiprocket/orders/create", { orderIds }, auth),
    assignAwb: (orderIds, courier_id, auth) => api.post("/shiprocket/assign-awb", { orderIds, courier_id }, auth),
    pickup: (orderIds, pickup_date, auth) => api.post("/shiprocket/pickup", { orderIds, pickup_date }, auth),
    cancel:    (shipment_id, auth) => api.post("/shiprocket/cancel", { shipment_id }, auth),
};
 