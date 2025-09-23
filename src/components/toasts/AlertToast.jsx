// src/components/Toasts/AlertToast.jsx
import React from "react";

const variants = {
  success: {
    bg: "bg-green-700 dark:bg-green-700",
    ring: "border-green-500 dark:border-green-500",
    text: "text-white",
    icon: "text-green-200",
    hover: "hover:bg-green-600",
  },
  info: {
    bg: "bg-blue-700 dark:bg-blue-700",
    ring: "border-blue-500 dark:border-blue-500",
    text: "text-white",
    icon: "text-blue-200",
    hover: "hover:bg-blue-600",
  },
  warn: {
    bg: "bg-amber-600 dark:bg-amber-600",
    ring: "border-amber-500 dark:border-amber-500",
    text: "text-white",
    icon: "text-amber-200",
    hover: "hover:bg-amber-500",
  },
  error: {
    bg: "bg-red-700 dark:bg-red-700",
    ring: "border-red-500 dark:border-red-500",
    text: "text-white",
    icon: "text-red-200",
    hover: "hover:bg-red-600",
  },
};

export default function AlertToast({ type = "info", message = "" }) {
  const v = variants[type] ?? variants.info;

  return (
    <div
      role="alert"
      className={[
        "rounded-xl border-l-4",
        "px-4 py-3",
        "min-w-[280px]",
        "flex items-center gap-2",
        "transition duration-200 ease-in-out",
        "shadow-md",
        v.bg, v.ring, v.text, v.hover,
      ].join(" ")}
    >
      <svg
        stroke="currentColor"
        viewBox="0 0 24 24"
        fill="none"
         className={`h-5 w-5 flex-shrink-0 ${v.icon}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <p className="text-sm font-semibold leading-5">{message}</p>
    </div>
  );
}
