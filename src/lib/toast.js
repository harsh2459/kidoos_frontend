// src/lib/toast.js
import { toast } from "react-toastify";
import AlertToast from "../components/toasts/AlertToast";

const baseOpts = {
  className: "p-0 bg-transparent shadow-none", // remove default toast bg
  bodyClassName: "p-0",
};

export const t = {
  ok:   (msg, opts) => toast(<AlertToast type="success" message={msg} />, { ...baseOpts, ...opts }),
  info: (msg, opts) => toast(<AlertToast type="info"    message={msg} />, { ...baseOpts, ...opts }),
  warn: (msg, opts) => toast(<AlertToast type="warn"    message={msg} />, { ...baseOpts, ...opts }),
  err:  (msg, opts) => toast(<AlertToast type="error"   message={msg} />, { ...baseOpts, ...opts }),
};
