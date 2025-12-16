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
  /**
   * Show success toast
   */
  success: (msg, opts) => toast.success(msg, { ...baseOpts, ...opts }),
  
  /**
   * Show error toast
   */
  error: (msg, opts) => toast.error(msg, { ...baseOpts, ...opts }),
  
  /**
   * Show info toast
   */
  info: (msg, opts) => toast.info(msg, { ...baseOpts, ...opts }),
  
  /**
   * Show warning toast
   */
  warn: (msg, opts) => toast.warn(msg, { ...baseOpts, ...opts }),
  
  /**
   * Show loading toast (persistent until dismissed)
   * @returns {string|number} Toast ID to dismiss later
   */
  loading: (msg, opts) => {
    return toast.info(msg, { 
      ...baseOpts, 
      autoClose: false, // Don't auto-close loading toasts
      closeButton: false, // Hide close button for loading
      ...opts 
    });
  },
  
  /**
   * Dismiss a toast by ID or dismiss all
   */
  dismiss: (toastId) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
  
  /**
   * Update an existing toast
   */
  update: (toastId, options) => {
    toast.update(toastId, options);
  },
  
  // Legacy compatibility
  ok: (msg, opts) => toast.success(msg, { ...baseOpts, ...opts }),
  err: (msg, opts) => toast.error(msg, { ...baseOpts, ...opts }),
};

export default t;