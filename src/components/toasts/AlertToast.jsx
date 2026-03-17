// src/components/toasts/AlertToast.jsx
import React from "react";

const cfg = {
  success: {
    borderColor: "#1E8449",
    chipBg: "#E9F7EF", chipColor: "#145A32", chipBorder: "#1E8449", chipLabel: "success",
    iconBg: "#E9F7EF", detailColor: "#1E8449", barColor: "#1E8449",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
        <rect x="2" y="1.5" width="9" height="13" rx="1.5" stroke="#1E8449" strokeWidth="1.4"/>
        <path d="M5 5h3M5 7.5h3M5 10h2" stroke="#1E8449" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="12.5" cy="12.5" r="2.5" fill="#1E8449"/>
        <path d="M11.5 12.5l.8.8 1.2-1.2" stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  error: {
    borderColor: "#B03A2E",
    chipBg: "#FDEDEB", chipColor: "#7B2418", chipBorder: "#C0392B", chipLabel: "error",
    iconBg: "#FDEDEB", detailColor: "#B03A2E", barColor: "#B03A2E",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
        <path d="M3 4h10M6 4V3h4v1M5.5 4l.5 8M10.5 4l-.5 8M8 4v8" stroke="#B03A2E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  info: {
    borderColor: "#1A6FA8",
    chipBg: "#E8F3FB", chipColor: "#0C447C", chipBorder: "#1A6FA8", chipLabel: "info",
    iconBg: "#E8F3FB", detailColor: "#1A6FA8", barColor: "#1A6FA8",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
        <circle cx="8" cy="8" r="5.5" stroke="#1A6FA8" strokeWidth="1.4"/>
        <path d="M8 7v4" stroke="#1A6FA8" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="5.5" r="0.7" fill="#1A6FA8"/>
      </svg>
    ),
  },
  warn: {
    borderColor: "#B7770D",
    chipBg: "#FEF9EC", chipColor: "#633806", chipBorder: "#B7770D", chipLabel: "warn",
    iconBg: "#FEF9EC", detailColor: "#B7770D", barColor: "#B7770D",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
        <path d="M8 2.5L14 13H2L8 2.5Z" stroke="#B7770D" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M8 6.5v3" stroke="#B7770D" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="11" r="0.7" fill="#B7770D"/>
      </svg>
    ),
  },
  loading: {
    borderColor: "#888780",
    chipBg: "#F1EFE8", chipColor: "#444441", chipBorder: "#888780", chipLabel: "loading",
    iconBg: "#F1EFE8", detailColor: "#5F5E5A", barColor: "#888780",
    icon: null,
  },
};

export default function AlertToast({ type = "info", title = "", detail, sub, chip, duration = 3000, closeToast }) {
  const v = cfg[type] || cfg.info;
  const chipLabel = chip || v.chipLabel;
  const isLoading = type === "loading";

  return (
    <div style={{ minWidth: 300, maxWidth: 380 }}>
      {/* Body */}
      <div
        role="alert"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 13,
          padding: "14px 16px 14px 14px",
          background: "#fff",
          border: "0.5px solid #e0ddd6",
          borderLeft: `3px solid ${v.borderColor}`,
          borderRadius: "10px 10px 0 0",
        }}
      >
        {/* Icon box */}
        <div
          style={{
            width: 32, height: 32,
            borderRadius: 8,
            background: v.iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 1,
          }}
        >
          {isLoading ? (
            <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
              <circle
                cx="8" cy="8" r="5.5"
                stroke="#B4B2A9" strokeWidth="1.4" strokeDasharray="3 2"
                style={{ animation: "toast-spin 1.1s linear infinite", transformOrigin: "8px 8px" }}
              />
              <circle cx="8" cy="8" r="2" fill="#888780"/>
            </svg>
          ) : v.icon}
        </div>

        {/* Text content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              display: "inline-block",
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "2px 7px",
              borderRadius: 4,
              marginBottom: 5,
              background: v.chipBg,
              color: v.chipColor,
              border: `0.5px solid ${v.chipBorder}`,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {chipLabel}
          </span>

          <p
            style={{
              fontFamily: "'EB Garamond', Georgia, serif",
              fontSize: 15,
              fontWeight: 500,
              color: "#1a1a1a",
              margin: "0 0 3px",
              lineHeight: 1.3,
            }}
          >
            {title}
          </p>

          {detail && (
            <p
              style={{
                fontSize: 12,
                fontFamily: "'EB Garamond', Georgia, serif",
                fontStyle: "italic",
                color: v.detailColor,
                margin: "0 0 4px",
                lineHeight: 1.3,
              }}
            >
              {detail}
            </p>
          )}

          {sub && (
            <p
              style={{
                fontSize: 12,
                color: "#6b7280",
                margin: 0,
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1.45,
              }}
            >
              {sub}
            </p>
          )}
        </div>

        {/* Close button */}
        {closeToast && (
          <button
            onClick={closeToast}
            aria-label="Close"
            style={{
              fontSize: 13,
              color: "#9ca3af",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0 2px",
              lineHeight: 1,
              flexShrink: 0,
              fontFamily: "system-ui",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 2.5,
          background: "#f3f3f0",
          borderRadius: "0 0 10px 10px",
          overflow: "hidden",
          border: "0.5px solid #e0ddd6",
          borderTop: "none",
        }}
      >
        {!isLoading && (
          <div
            style={{
              height: "100%",
              background: v.barColor,
              width: "100%",
              animation: `toast-drain ${duration}ms linear forwards`,
              animationDelay: "0.3s",
            }}
          />
        )}
      </div>
    </div>
  );
}
