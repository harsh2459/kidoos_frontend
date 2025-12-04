// src/components/Toasts/AlertToast.jsx
import React from "react";
import { CheckCircle, Info, AlertTriangle, XCircle } from "lucide-react";

// Theme-consistent variants
const variants = {
  success: {
    bg: "bg-[#E8F0EB] border-[#4A7C59]", // Sage background, Green border
    text: "text-[#1A3C34]",
    iconColor: "text-[#4A7C59]",
    Icon: CheckCircle,
  },
  info: {
    bg: "bg-[#F4F7F5] border-[#1A3C34]", // Light background, Deep Forest border
    text: "text-[#2C3E38]",
    iconColor: "text-[#1A3C34]",
    Icon: Info,
  },
  warn: {
    bg: "bg-[#FFF9F0] border-[#8A6A4B]", // Warm background, Gold/Earth border
    text: "text-[#5C4D40]",
    iconColor: "text-[#8A6A4B]",
    Icon: AlertTriangle,
  },
  error: {
    bg: "bg-[#FFF5F5] border-[#E53E3E]", // Light Red background, Red border
    text: "text-[#742A2A]",
    iconColor: "text-[#E53E3E]",
    Icon: XCircle,
  },
};

export default function AlertToast({ type = "info", message = "" }) {
  // Default to 'info' if type is invalid
  const v = variants[type] || variants.info;
  const IconComponent = v.Icon;

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 
        min-w-[300px] max-w-md 
        p-4 rounded-xl border-l-4 shadow-lg 
        transition-all duration-300 ease-in-out transform hover:scale-[1.02]
        ${v.bg}
      `}
    >
      <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${v.iconColor}`} />
      
      <div className="flex-1">
        <p className={`text-sm font-medium leading-relaxed ${v.text}`}>
          {message}
        </p>
      </div>
    </div>
  );
}