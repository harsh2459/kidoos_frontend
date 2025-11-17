import React, { useEffect, useRef, useState } from "react";
import {
  FaWhatsapp,
  FaInstagram,
  FaShareAlt,
} from "react-icons/fa";
import { FaThreads } from "react-icons/fa6"

export default function FloatingSocialMenu({
  initial = { x: 20, y: 220 },
  phone = "919879857529",
  storageKey = "floatingSocialPos",
}) {
  const [pos, setPos] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return initial;
  });

  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [direction, setDirection] = useState("right"); // 'left' | 'right' | 'center'

  const startRef = useRef(null);
  const movedRef = useRef(false);

  const items = [
    {
      id: "threads",
      icon: <FaThreads />,
      href: "https://www.threads.com/@kiddosintellect",
      title: "Threads",
      bg: "hsl(var(--brand))",
      color: "hsl(var(--brand-foreground))",
    },
    {
      id: "instagram",
      icon: <FaInstagram />,
      href: "https://www.instagram.com/kiddosintellect/",
      title: "Instagram",
      bg: "#E4405F",
      color: "#fff",
    },
    {
      id: "whatsapp",
      icon: <FaWhatsapp />,
      href: `https://wa.me/${phone}`,
      title: "WhatsApp",
      bg: "#25D366",
      color: "#fff",
    },
  ];

  const offsetsFor = {
    right: [
      { x: 78, y: 0 },
      { x: 58, y: -58 },
      { x: 58, y: 58 },
      { x: 138, y: 0 },
    ],
    left: [
      { x: -78, y: 0 },
      { x: -58, y: -58 },
      { x: -58, y: 58 },
      { x: -138, y: 0 },
    ],
    center: [
      { x: -70, y: 0 },
      { x: -45, y: -60 },
      { x: 45, y: -60 },
      { x: 70, y: 0 },
    ],
  };

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(pos));
    } catch (e) { }
  }, [pos, storageKey]);

  function recomputeDirection(x = pos.x) {
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const leftThreshold = vw * 0.33;
    const rightThreshold = vw * 0.66;
    if (x < leftThreshold) setDirection("right");
    else if (x > rightThreshold) setDirection("left");
    else setDirection("center");
  }

  useEffect(() => {
    recomputeDirection();
    function onResize() {
      setPos((p) => ({
        x: Math.max(8, Math.min(window.innerWidth - 72, p.x)),
        y: Math.max(8, Math.min(window.innerHeight - 80, p.y)),
      }));
      recomputeDirection();
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startDrag(clientX, clientY) {
    startRef.current = { x: clientX, y: clientY, left: pos.x, top: pos.y };
    movedRef.current = false;
    setDragging(true);
  }
  function moveDrag(clientX, clientY) {
    if (!startRef.current) return;
    const dx = clientX - startRef.current.x;
    const dy = clientY - startRef.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) movedRef.current = true;
    const newX = startRef.current.left + dx;
    const newY = startRef.current.top + dy;
    const clampedX = Math.max(8, Math.min(window.innerWidth - 72, newX));
    const clampedY = Math.max(8, Math.min(window.innerHeight - 80, newY));
    setPos({ x: clampedX, y: clampedY });
    recomputeDirection(clampedX);
  }
  function endDrag() {
    setDragging(false);
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const margin = 12;
    const snapLeft = pos.x < vw / 2;
    const toX = snapLeft ? margin : vw - margin - 64;
    const finalY = Math.max(8, Math.min(window.innerHeight - 80, pos.y));
    setPos({ x: toX, y: finalY });
    recomputeDirection(toX);
    startRef.current = null;
  }

  function onMouseDown(e) {
    if (e.button !== 0) return;
    startDrag(e.clientX, e.clientY);
    e.preventDefault();
  }
  function onMouseMove(e) {
    if (!dragging) return;
    moveDrag(e.clientX, e.clientY);
  }
  function onMouseUp() {
    if (!dragging) return;
    if (!movedRef.current) setOpen((s) => !s);
    endDrag();
  }
  function onTouchStart(e) {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  }
  function onTouchMove(e) {
    if (!dragging) return;
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
    e.preventDefault();
  }
  function onTouchEnd() {
    if (!dragging) return;
    if (!movedRef.current) setOpen((s) => !s);
    endDrag();
  }

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, pos]);

  const offsets = offsetsFor[direction] || offsetsFor.center;

  return (
    <>
      {/* WAVE ANIMATION STYLES - ONLY ADDITION */}
      <style>{`
        @keyframes wave-pulse {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        .wave-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 48px;
          height: 48px;
          margin-left: -24px;
          margin-top: -24px;
          border-radius: 50%;
          background: hsl(var(--brand));
          pointer-events: none;
        }

        .wave-ring-1 {
          animation: wave-pulse 1s ease-out infinite;
          animation-delay: 0s;
        }

        .wave-ring-2 {
          animation: wave-pulse 1s ease-out infinite;
          animation-delay: 1s;
        }

        .wave-ring-3 {
          animation: wave-pulse 1s ease-out infinite;
          animation-delay: 2s;
        }
      `}</style>

      <div
        className="fixed z-[9999] select-none"
        style={{ left: pos.x, top: pos.y, touchAction: "none", width: 64, height: 64 }}
      >
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          role="button"
          tabIndex={0}
          aria-label="Open social share menu"
          style={{ width: 64, height: 64, position: 'relative' }}
        >
          {/* social icons */}
          {items.map((it, i) => {
            const off = offsets[i] || { x: 0, y: 0 };
            const transform = open ? `translate(${off.x}px, ${off.y}px) scale(1)` : `translate(0,0) scale(0)`;
            const delay = `${i * 45}ms`;
            return (
              <a
                key={it.id}
                href={it.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={() => setHovered(it.id)}
                onMouseLeave={() => setHovered(null)}
                className="absolute left-0 top-0 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-popup outline-none"
                title={it.title}
                aria-label={it.title}
                style={{
                  transform,
                  transition: `transform 260ms cubic-bezier(.2,.9,.3,1) ${delay}`,
                  background: it.bg,
                  color: it.color,
                  boxShadow: open ? "0 10px 24px rgba(15,23,42,0.18)" : "none",
                  zIndex: open ? 2 : 0,
                }}
              >
                <span style={{ pointerEvents: "none", fontSize: 16, color: it.color }}>{it.icon}</span>

                {hovered === it.id && (
                  <span
                    className="absolute whitespace-nowrap text-sm px-2 py-1 rounded-md text-gray-800 bg-white shadow-md left-14 top-1/2 -translate-y-1/2"
                    style={{ fontSize: 12 }}
                  >
                    {it.title}
                  </span>
                )}
              </a>
            );
          })}

          {/* MAIN BUTTON (brand-styled) WITH WAVE RINGS */}
          <div
            className={`w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl border-2 border-white`}
            style={{
              transform: dragging ? "scale(0.98)" : "scale(1)",
              transition: "transform 160ms",
              boxShadow: "0 10px 30px rgba(2,6,23,0.18)",
              position: 'relative',
            }}
            onMouseDown={(e) => {
              startDrag(e.clientX, e.clientY);
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              const t = e.touches[0];
              startDrag(t.clientX, t.clientY);
              e.stopPropagation();
            }}
          >
            {/* WAVE RINGS - ONLY ADDITION */}
            <span className="wave-ring wave-ring-1"></span>
            <span className="wave-ring wave-ring-2"></span>
            <span className="wave-ring wave-ring-3"></span>

            {/* inner accent uses brand color now so it matches the theme */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: "hsl(var(--brand))",           // brand background
                color: "hsl(var(--brand-foreground))",     // icon color (usually white)
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                position: 'relative',
                zIndex: 1,
              }}
            >
              <FaShareAlt size={18} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
