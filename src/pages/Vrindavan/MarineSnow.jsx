// components/MarineSnow.jsx
import { useEffect, useRef, useState } from "react";

const MarineSnow = ({ count = 50 }) => {
  const containerRef = useRef(null);
  const [gsapLoaded, setGsapLoaded] = useState(false);
  const gsapRef = useRef(null);

  // Load GSAP dynamically
  useEffect(() => {
    let mounted = true;

    const loadGsap = async () => {
      try {
        const gsapModule = await import("gsap");

        if (mounted) {
          gsapRef.current = gsapModule.default;
          setGsapLoaded(true);
        }
      } catch (error) {
        console.error("Failed to load GSAP:", error);
      }
    };

    loadGsap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!gsapLoaded || !gsapRef.current) return;

    const gsap = gsapRef.current;

    const ctx = gsap.context(() => {
      // Create random particles
      for (let i = 0; i < count; i++) {
        const particle = document.createElement("div");
        particle.classList.add("snow-particle");
        
        // Random properties
        const size = Math.random() * 3 + 1; // 1px to 4px
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = Math.random() * 10 + 10; // 10s to 20s float
        
        particle.style.cssText = `
          position: absolute;
          left: ${x}%;
          top: ${y}%;
          width: ${size}px;
          height: ${size}px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          pointer-events: none;
        `;
        
        containerRef.current.appendChild(particle);

        // Animate them floating up/down gently
        gsap.to(particle, {
          y: `+=${Math.random() * 100 - 50}`,
          x: `+=${Math.random() * 50 - 25}`,
          opacity: Math.random(),
          duration: duration,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [count, gsapLoaded]);

  return <div ref={containerRef} className="absolute inset-0 z-20 pointer-events-none overflow-hidden" />;
};

export default MarineSnow;