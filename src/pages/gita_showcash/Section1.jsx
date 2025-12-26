import React, { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

const Section1 = () => {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  // 1. TIGHTENED TRACK: Reduced to 110vh to eliminate the "big gap"
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  // 2. FAST MAPPING: The shrink finishes at 0.7 scroll progress
  // This leaves 0.3 of the scroll to reveal the next section seamlessly
  const scale = useTransform(smoothProgress, [0, 0.7], [1, 0.85])
  const borderRadius = useTransform(smoothProgress, [0, 0.7], ["0px", "48px"])
  const textOpacity = useTransform(smoothProgress, [0, 0.3], [1, 0])

  useEffect(() => {
    if (!canvasRef.current || window._liquidApp) return
    const script = document.createElement("script")
    script.type = "module"
    
    // Path points to your public folder asset
    const imageUrl = "/images/gita_showcash.png" 

    script.textContent = `
      import LiquidBackground from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js';
      const canvas = document.getElementById('liquid-canvas');
      if (canvas) {
        const app = LiquidBackground(canvas);
        app.loadImage('${imageUrl}');
        app.liquidPlane.material.metalness = 0.1;
        app.liquidPlane.material.roughness = 0.2;
        app.liquidPlane.uniforms.displacementScale.value = 1.0;
        app.setRain(false);
        window._liquidApp = app;
      }
    `
    document.body.appendChild(script)
    return () => {
      if (window._liquidApp?.dispose) window._liquidApp.dispose()
      if (document.body.contains(script)) document.body.removeChild(script)
      delete window._liquidApp
    }
  }, [])

  return (
    <div ref={containerRef} className="relative h-[110vh] bg-black">
      {/* STICKY CONTAINER */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden z-20">
        
        {/* THE PORTAL */}
        <motion.div 
          style={{ scale, borderRadius }}
          className="relative w-full h-full overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.9)] bg-zinc-950"
        >
          <canvas ref={canvasRef} id="liquid-canvas" className="absolute inset-0 w-full h-full z-0 block" />
          
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 z-10 pointer-events-none" />

          <motion.div 
            style={{ opacity: textOpacity }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
          >
            <h1 className="text-white text-6xl md:text-[120px] font-serif font-bold tracking-tighter leading-none drop-shadow-2xl">
              Divine Wisdom.
            </h1>
            <p className="text-white/80 text-lg md:text-xl mt-6 font-light max-w-xl">
              Experience the Gita like never before.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Section1