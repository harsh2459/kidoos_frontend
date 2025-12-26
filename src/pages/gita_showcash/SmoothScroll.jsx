// src/SmoothScroll.jsx
import React from 'react'
import { ReactLenis } from 'lenis/react' // NOTE: New Import Path

function SmoothScroll({ children }) {
  const lenisOptions = {
    lerp: 0.1,      // The "weight" of the scroll (lower = smoother/heavier)
    duration: 1.5,  // Duration of the glide
    smoothTouch: false, // Keep mobile native for performance
    smooth: true,
  }

  return (
    <ReactLenis root options={lenisOptions}>
      {children}
    </ReactLenis>
  )
}

export default SmoothScroll