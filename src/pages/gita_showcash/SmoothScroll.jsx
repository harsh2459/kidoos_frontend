// src/SmoothScroll.jsx
import React, { useState, useEffect } from 'react'

function SmoothScroll({ children }) {
  const [ReactLenis, setReactLenis] = useState(null);

  // Load lenis dynamically
  useEffect(() => {
    let mounted = true;

    const loadLenis = async () => {
      try {
        const module = await import('lenis/react');
        if (mounted) {
          setReactLenis(() => module.ReactLenis);
        }
      } catch (error) {
        console.error('Failed to load lenis:', error);
      }
    };

    loadLenis();

    return () => {
      mounted = false;
    };
  }, []);

  const lenisOptions = {
    lerp: 0.1,      // The "weight" of the scroll (lower = smoother/heavier)
    duration: 1.5,  // Duration of the glide
    smoothTouch: false, // Keep mobile native for performance
    smooth: true,
  }

  // Render children without smooth scroll while loading
  if (!ReactLenis) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={lenisOptions}>
      {children}
    </ReactLenis>
  )
}

export default SmoothScroll