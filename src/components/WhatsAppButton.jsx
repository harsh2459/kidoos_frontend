import React, { useEffect, useRef, useState } from "react";
import { FaWhatsapp, FaInstagram, FaFacebookF, FaTwitter } from "react-icons/fa";
import { FaThreads, FaXTwitter } from "react-icons/fa6";
import { Share2, X } from "lucide-react";

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
  const [direction, setDirection] = useState("right");

  const startRef = useRef(null);
  const movedRef = useRef(false);
  const hoverTimeoutRef = useRef(null);

  // --- Social Items Configuration ---
  const items = [
    {
      id: "threads",
      icon: <FaThreads size={18} />,
      href: "https://www.threads.com/@kiddosintellect",
      title: "Threads",
      bg: "#000000",
      color: "#fff",
    },
    {
      id: "instagram",
      icon: <FaInstagram size={18} />,
      href: "https://www.instagram.com/kiddosintellect/",
      title: "Instagram",
      bg: "#E4405F",
      color: "#fff",
    },
    {
      id: "whatsapp",
      icon: <FaWhatsapp size={20} />,
      href: `https://wa.me/${phone}`,
      title: "WhatsApp",
      bg: "#25D366",
      color: "#fff",
    },
    {
      id: "X",
      icon: <FaXTwitter size={16} />,
      href: 'https://x.com/KiddosIntellect',
      title: "X",
      bg: "#000000",
      color: "#fff",
    },
    {
      id: "Facebook",
      icon: <FaFacebookF size={18} />,
      href: 'https://www.facebook.com/people/Kiddos-Intellect/61579945910642/',
      title: "Facebook",
      bg: "#1877F2",
      color: "#fff",
    },
  ];

  // --- Positioning Logic for the Fan Menu (FIXED ALIGNMENT) ---
  const offsetsFor = {
    right: [
      { x: 80, y: 0 },     // 1. Center Right
      { x: 70, y: -60 },   // 2. Top Right Diag
      { x: 70, y: 60 },    // 3. Bottom Right Diag
      { x: 0, y: -85 },    // 4. Top Center
      { x: 0, y: 85 },     // 5. Bottom Center
    ],
    left: [
      { x: -80, y: 0 },    // 1. Center Left
      { x: -70, y: -60 },  // 2. Top Left Diag
      { x: -70, y: 60 },   // 3. Bottom Left Diag
      { x: 0, y: -85 },    // 4. Top Center
      { x: 0, y: 85 },     // 5. Bottom Center
    ],
    center: [
      { x: 0, y: -90 },
      { x: 75, y: -50 },
      { x: -75, y: -50 },
      { x: 75, y: 50 },
      { x: -75, y: 50 },
    ],
  };

  // --- Persist Position ---
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(pos));
    } catch (e) { }
  }, [pos, storageKey]);

  // --- Responsive Direction Calculation ---
  function recomputeDirection(x = pos.x) {
    const vw = window.innerWidth || document.documentElement.clientWidth;
    if (x < vw / 2) setDirection("right");
    else setDirection("left");
  }

  // Handle Window Resize
  useEffect(() => {
    recomputeDirection();
    function onResize() {
      setPos((p) => ({
        x: Math.max(16, Math.min(window.innerWidth - 80, p.x)),
        y: Math.max(16, Math.min(window.innerHeight - 90, p.y)),
      }));
      recomputeDirection();
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Drag Logic ---
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
    
    const clampedX = Math.max(16, Math.min(window.innerWidth - 80, newX));
    const clampedY = Math.max(16, Math.min(window.innerHeight - 90, newY));
    
    setPos({ x: clampedX, y: clampedY });
    recomputeDirection(clampedX);
  }

  function endDrag() {
    setDragging(false);
    if (movedRef.current) {
      const vw = window.innerWidth || document.documentElement.clientWidth;
      const margin = 20;
      const snapLeft = pos.x < vw / 2;
      const toX = snapLeft ? margin : vw - margin - 64;
      
      const finalY = Math.max(20, Math.min(window.innerHeight - 90, pos.y));
      
      setPos({ x: toX, y: finalY });
      recomputeDirection(toX);
    }
    startRef.current = null;
  }

  // --- Hover with 0.5s delay ---
  function handleMouseEnter() {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setOpen(true);
    }, 500); // 0.5 seconds delay
  }

  function handleMouseLeave() {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    // Keep open for 0.5s after leaving
    hoverTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 500);
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // Mouse Events
  function onMouseDown(e) {
    if (e.button !== 0) return;
    startDrag(e.clientX, e.clientY);
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

  // Touch Events
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
      
      <div
        className="fixed z-[9999] select-none"
        style={{ 
          left: pos.x, 
          top: pos.y, 
          touchAction: "none", 
          width: 64, 
          height: 64 
        }}
      >
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          role="button"
          tabIndex={0}
          aria-label="Open social share menu"
          style={{ width: 64, height: 64, position: 'relative' }}
        >
          {/* --- SOCIAL ICONS (Fan Out) --- */}
          {items.map((it, i) => {
            const off = offsets[i] || { x: 0, y: 0 };
            const transform = open 
              ? `translate(${off.x}px, ${off.y}px) scale(1)` 
              : `translate(0, 0) scale(0.3)`;
            
            const opacity = open ? 1 : 0;
            const pointerEvents = open ? 'auto' : 'none';
            const delay = `${i * 60}ms`;

            return (
              <a
                key={it.id}
                href={it.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={() => setHovered(it.id)}
                onMouseLeave={() => setHovered(null)}
                className="absolute rounded-full flex items-center justify-center text-white shadow-lg outline-none transition-all duration-300 ease-out"
                title={it.title}
                style={{
                  width: 48,
                  height: 48,
                  left: '50%',
                  top: '50%',
                  marginLeft: -24,
                  marginTop: -24,
                  transform,
                  opacity,
                  pointerEvents,
                  transitionDelay: open ? delay : '0ms',
                  backgroundColor: it.bg,
                  color: it.color,
                  zIndex: open ? 10 : -1,
                }}
              >
                {it.icon}

                {/* Tooltip on Hover */}
                {hovered === it.id && open && (
                  <span
                    className={`absolute whitespace-nowrap text-xs font-bold px-2 py-1 rounded bg-[#1A3C34] text-white shadow-md
                    ${direction === 'right' ? 'left-14' : 'right-14'} top-1/2 -translate-y-1/2`}
                  >
                    {it.title}
                  </span>
                )}
              </a>
            );
          })}

          {/* --- MAIN TOGGLE BUTTON --- */}
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl cursor-move transition-transform duration-200`}
            style={{
              backgroundColor: "#1A3C34",
              color: "#ffffff",
              transform: dragging ? "scale(0.95)" : (open ? "scale(1.05)" : "scale(1)"),
              position: 'relative',
              border: "3px solid #fff",
            }}
          >

            {/* Icon Switch (Share vs Close) */}
            <div className="relative z-10 flex items-center justify-center transition-all duration-300">
              {open ? (
                <X className="w-7 h-7" />
              ) : (
                <Share2 className="w-6 h-6" />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
