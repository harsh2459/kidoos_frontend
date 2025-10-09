// src/lib/toast.js
import { toast } from "react-toastify";

const baseOpts = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const t = {
  success: (msg, opts) => toast.success(msg, { ...baseOpts, ...opts }),
  error: (msg, opts) => toast.error(msg, { ...baseOpts, ...opts }),
  info: (msg, opts) => toast.info(msg, { ...baseOpts, ...opts }),
  warn: (msg, opts) => toast.warn(msg, { ...baseOpts, ...opts }),
  // Legacy compatibility
  ok: (msg, opts) => toast.success(msg, { ...baseOpts, ...opts }),
  err: (msg, opts) => toast.error(msg, { ...baseOpts, ...opts }),
};
