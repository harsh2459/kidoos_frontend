import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Section2 = () => {
  const containerRef = useRef(null)
  
  // Refs for the 3 Books
  const leftBookRef = useRef(null)
  const centerBookRef = useRef(null)
  const rightBookRef = useRef(null)
  
  // Background Refs
  const portalBgRef = useRef(null)
  const glowRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom", // Starts when section enters screen
          end: "center center", // Locks in when centered
          scrub: 1,
        }
      })

      // 1. PORTAL OPENS (Background)
      tl.to(portalBgRef.current, { opacity: 1, scale: 1, duration: 1 }, "start")
      tl.to(glowRef.current, { opacity: 0.6, scale: 1.2, duration: 1 }, "start")

      // 2. CENTER BOOK RISES (Fast & Sharp)
      tl.fromTo(centerBookRef.current, 
        { y: 400, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" },
        "start"
      )

      // 3. SIDE BOOKS RISE (Slower & Blurred)
      // They appear to be "behind" the main book
      tl.fromTo([leftBookRef.current, rightBookRef.current],
        { y: 500, opacity: 0, scale: 0.6, filter: "blur(20px)" },
        { y: 50, opacity: 0.5, scale: 0.8, filter: "blur(5px)", duration: 2, stagger: 0.1 },
        "start+=0.2"
      )

    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative min-h-screen w-full bg-black flex items-center justify-center overflow-hidden py-24">
      
      {/* --- LAYER 1: PORTAL BACKGROUND --- */}
      <div 
        ref={portalBgRef} 
        className="absolute inset-0 z-0 opacity-0 bg-[url('https://assets.codepen.io/1468070/star-bg.jpg')] bg-cover bg-center"
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* --- LAYER 2: GLOW --- */}
      <div 
        ref={glowRef}
        className="absolute z-0 w-[800px] h-[800px] bg-gradient-to-r from-purple-900/30 to-[#FFD700]/10 rounded-full blur-[120px] opacity-0"
      />

      {/* --- LAYER 3: THE TRILOGY STAGE --- */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-center perspective-1000">

        {/* LEFT BOOK (Volume 2) */}
        <div 
          ref={leftBookRef}
          className="absolute left-4 md:left-20 w-[20vw] h-[30vw] md:w-[18vw] md:h-[28vw] bg-[#1a1a1a] rounded-lg border border-white/5 shadow-2xl z-10 origin-right transform -rotate-y-12"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/80" />
          {/* Label */}
          <div className="absolute bottom-6 w-full text-center">
             <span className="text-white/20 text-[10px] tracking-widest uppercase">Vol. II</span>
          </div>
        </div>

        {/* RIGHT BOOK (Volume 3) */}
        <div 
          ref={rightBookRef}
          className="absolute right-4 md:right-20 w-[20vw] h-[30vw] md:w-[18vw] md:h-[28vw] bg-[#1a1a1a] rounded-lg border border-white/5 shadow-2xl z-10 origin-left transform rotate-y-12"
        >
          <div className="absolute inset-0 bg-gradient-to-bl from-white/5 to-black/80" />
           {/* Label */}
           <div className="absolute bottom-6 w-full text-center">
             <span className="text-white/20 text-[10px] tracking-widest uppercase">Vol. III</span>
          </div>
        </div>

        {/* CENTER BOOK (Main Volume) */}
        <div 
          ref={centerBookRef}
          className="relative z-20 w-[70vw] md:w-[30vw] h-[50vh] md:h-[40vw] bg-[#0F0F0F] rounded-2xl border border-white/10 shadow-[0_0_100px_rgba(255,215,0,0.15)] overflow-hidden flex flex-col items-center justify-center text-center group"
        >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/80" />
            
            <div className="relative z-10 p-8">
                <span className="block text-[#FFD700] tracking-[0.4em] text-[10px] md:text-xs uppercase mb-6 opacity-80">
                    The Divine Song
                </span>
                <h1 className="text-white text-5xl md:text-7xl font-serif font-bold leading-none mb-8 drop-shadow-2xl">
                    The <br/> Gita.
                </h1>
                <div className="w-12 h-[1px] bg-[#FFD700] mx-auto mb-8 opacity-50" />
                <p className="text-white/40 font-light text-xs tracking-widest uppercase">
                    Volume I • Karma Yoga
                </p>
            </div>
        </div>

      </div>
    </div>
  )
}

export default Section2