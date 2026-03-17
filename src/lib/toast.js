// src/lib/toast.js
import { toast } from "react-toastify";
import React from "react";
import AlertToast from "../components/toasts/AlertToast";

const DEFAULT_DURATION = 3000;

const baseOpts = {
  position: "top-right",
  autoClose: DEFAULT_DURATION,
  hideProgressBar: true,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true,
  closeButton: false,
  style: { background: "transparent", boxShadow: "none", padding: 0, minHeight: "unset" },
  bodyStyle: { padding: 0, margin: 0 },
};

/**
 * Build the toast content renderer.
 * msg can be a plain string (used as title) or an object:
 *   { title, detail?, sub?, chip? }
 */
function render(type, msg, duration) {
  const props = typeof msg === "string" ? { title: msg } : msg;
  return ({ closeToast }) =>
    React.createElement(AlertToast, { type, closeToast, duration, ...props });
}

function dur(opts) {
  return opts?.autoClose ?? DEFAULT_DURATION;
}

export const t = {
  success: (msg, opts) => toast(render("success", msg, dur(opts)), { ...baseOpts, ...opts }),
  error:   (msg, opts) => toast(render("error",   msg, dur(opts)), { ...baseOpts, ...opts }),
  info:    (msg, opts) => toast(render("info",    msg, dur(opts)), { ...baseOpts, ...opts }),
  warn:    (msg, opts) => toast(render("warn",    msg, dur(opts)), { ...baseOpts, ...opts }),

  /** Loading toast — stays until manually dismissed. Returns toast ID. */
  loading: (msg, opts) =>
    toast(render("loading", msg, false), {
      ...baseOpts,
      autoClose: false,
      closeButton: false,
      ...opts,
    }),

  dismiss: (toastId) => (toastId ? toast.dismiss(toastId) : toast.dismiss()),
  update:  (toastId, options) => toast.update(toastId, options),

  // Legacy aliases
  ok:  (msg, opts) => toast(render("success", msg, dur(opts)), { ...baseOpts, ...opts }),
  err: (msg, opts) => toast(render("error",   msg, dur(opts)), { ...baseOpts, ...opts }),
};

export default t;
