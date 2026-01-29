// components/MarineSnow.jsx
import { useEffect, useRef } from "react";
import gsap from "gsap";

const MarineSnow = ({ count = 50 }) => {
  const containerRef = useRef(null);

  useEffect(() => {
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
  }, [count]);

  return <div ref={containerRef} className="absolute inset-0 z-20 pointer-events-none overflow-hidden" />;
};

export default MarineSnow;