// src/components/BookFeatureDeepDive.jsx
import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';

const BookFeatureDeepDive = () => {
    const containerRef = useRef(null);
    const [gsapLoaded, setGsapLoaded] = useState(false);
    const gsapRef = useRef(null);
    const ScrollTriggerRef = useRef(null);
    const bookWrapperRef = useRef(null);
    const bookRef = useRef(null);
    const textRef1 = useRef(null);
    const textRef2 = useRef(null);
    const textRef3 = useRef(null);
    const progressBarRef = useRef(null);

    // Load GSAP dynamically
    useEffect(() => {
        let mounted = true;

        const loadGsap = async () => {
            try {
                const [gsapModule, scrollTriggerModule] = await Promise.all([
                    import("gsap"),
                    import("gsap/ScrollTrigger")
                ]);

                if (mounted) {
                    gsapRef.current = gsapModule.gsap;
                    ScrollTriggerRef.current = scrollTriggerModule.ScrollTrigger;
                    gsapModule.gsap.registerPlugin(scrollTriggerModule.ScrollTrigger);
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

    useLayoutEffect(() => {
        if (!gsapLoaded || !gsapRef.current || !ScrollTriggerRef.current) return;

        const gsap = gsapRef.current;
        const ScrollTrigger = ScrollTriggerRef.current;

        const ctx = gsap.context(() => {
            
            // MASTER TIMELINE
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top", // Starts exactly when section hits top
                    end: "+=3500",    // Very long scroll for smooth reading
                    scrub: 1,         // Smooth catch-up
                    pin: true,        // Locks the screen
                    anticipatePin: 1
                }
            });

            // 1. THE BOOK MOVEMENT (The "Smooth Ride")
            // The book stays relatively centered but drifts slightly down to feel "heavy"
            tl.to(bookWrapperRef.current, {
                yPercent: 20, // Moves down slightly (20% of screen)
                scale: 1.1,   // Grows slightly larger
                rotation: 2,  // Slight tilt for realism
                duration: 10,
                ease: "none"
            }, 0);

            // 2. THE PROGRESS LINE (Golden Thread)
            tl.to(progressBarRef.current, {
                height: "100%",
                duration: 10,
                ease: "none"
            }, 0);

            // --- FEATURE 1 (Left Side) - 10% to 30% scroll ---
            tl.fromTo(textRef1.current, 
                { opacity: 0, x: -100, filter: "blur(20px)" },
                { opacity: 1, x: 0, filter: "blur(0px)", duration: 2, ease: "power2.out" }, 1
            );
            tl.to(textRef1.current, 
                { opacity: 0, y: -50, filter: "blur(10px)", duration: 2 }, 3
            );

            // --- FEATURE 2 (Right Side) - 40% to 60% scroll ---
            tl.fromTo(textRef2.current, 
                { opacity: 0, x: 100, filter: "blur(20px)" },
                { opacity: 1, x: 0, filter: "blur(0px)", duration: 2, ease: "power2.out" }, 4.5
            );
            tl.to(textRef2.current, 
                { opacity: 0, y: -50, filter: "blur(10px)", duration: 2 }, 6.5
            );

            // --- FEATURE 3 (Center) - 70% to End ---
            tl.fromTo(textRef3.current, 
                { opacity: 0, scale: 0.8, filter: "blur(20px)" },
                { opacity: 1, scale: 1, filter: "blur(0px)", duration: 2.5, ease: "back.out(1.7)" }, 7.5
            );

        }, containerRef);
        return () => ctx.revert();
    }, [gsapLoaded]);

    return (
        <section ref={containerRef} className="relative w-full h-screen bg-[#0a0503] overflow-hidden">
            
            {/* ============================================================== */}
            {/* THE BRIDGE: Seamless Connection to Previous Section            */}
            {/* ============================================================== */}
            <div className="absolute top-0 left-0 w-full h-[30vh] z-10 pointer-events-none">
                {/* This gradient matches your light grey previous section (#f5f5f7) and fades to dark */}
                <div className="w-full h-full bg-gradient-to-b from-[#f5f5f7] via-[#0a0503]/80 to-[#0a0503]"></div>
            </div>

            {/* BACKGROUND PARTICLES (The "Atmosphere") */}
            <div className="absolute inset-0 opacity-30 pointer-events-none z-0">
                 {/* A center spotlight to highlight the book */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-600/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 mix-blend-overlay"></div>
            </div>

            {/* THE GOLDEN THREAD (Center Line) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-white/5 z-0">
                <div ref={progressBarRef} className="w-full bg-gradient-to-b from-amber-300 to-amber-600 shadow-[0_0_15px_#f59e0b] h-0"></div>
            </div>

            {/* ============================================================== */}
            {/* THE HERO BOOK (Centered Viewport)                              */}
            {/* ============================================================== */}
            <div 
                ref={bookWrapperRef}
                className="absolute top-[15%] left-0 w-full flex justify-center z-20"
                style={{ willChange: "transform" }} // GPU Optimization
            >
                <div className="relative w-[280px] md:w-[380px] aspect-[2/3] perspective-1000 group">
                    
                    {/* Floating Shadow (Moves naturally) */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-[20%] bg-black/60 blur-xl rounded-full transition-all duration-700" />
                    
                    {/* The Book Image */}
                    <div ref={bookRef} className="relative w-full h-full rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10">
                        {/* CHANGE THIS IMAGE TO YOUR MAIN BOOK COVER */}
                        <img 
                            src="/images-webp/1.webp" 
                            alt="The Selected Gita" 
                            className="w-full h-full object-cover"
                        />
                        
                        {/* Dynamic Sheen Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-50 mix-blend-overlay"></div>
                    </div>
                </div>
            </div>

            {/* ============================================================== */}
            {/* THE FLOATING FEATURES (Text Layers)                            */}
            {/* ============================================================== */}

            {/* FEATURE 1: LEFT */}
            <div ref={textRef1} className="absolute top-[35%] left-[5%] md:left-[10%] w-[90%] md:w-[25%] text-left z-30 pointer-events-none">
                <span className="text-amber-500 font-bold tracking-[0.3em] text-xs uppercase mb-2 block">
                    Authentic Artistry
                </span>
                <h3 className="text-3xl md:text-5xl text-[#f5e6d3] font-serif leading-tight mb-4 drop-shadow-lg">
                    Not Just Cartoons.<br/>Sacred Art.
                </h3>
                <p className="text-white/70 font-light leading-relaxed text-lg">
                    Every illustration is crafted to preserve the <em>'Bhav'</em> (emotion), connecting your child to the Divine visually.
                </p>
            </div>

            {/* FEATURE 2: RIGHT */}
            <div ref={textRef2} className="absolute top-[50%] right-[5%] md:right-[10%] w-[90%] md:w-[25%] text-left md:text-right z-30 pointer-events-none">
                <span className="text-amber-500 font-bold tracking-[0.3em] text-xs uppercase mb-2 block">
                    Zero Compromise
                </span>
                <h3 className="text-3xl md:text-5xl text-[#f5e6d3] font-serif leading-tight mb-4 drop-shadow-lg">
                    Premium Vedic<br/>Paper Quality.
                </h3>
                <p className="text-white/70 font-light leading-relaxed text-lg">
                    Thick, archival-grade paper designed to survive toddler hands and last for generations.
                </p>
            </div>

            {/* FEATURE 3: CENTER BOTTOM */}
            <div ref={textRef3} className="absolute bottom-[10%] left-1/2 -translate-x-1/2 text-center w-full px-6 z-40">
                <h2 className="text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 font-serif mb-8 drop-shadow-2xl">
                    The Ultimate Gift.
                </h2>
                <div className="flex justify-center gap-6">
                    <button className="px-10 py-4 bg-amber-500 text-black font-bold tracking-widest rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                        ORDER NOW
                    </button>
                    <button className="px-10 py-4 border border-white/20 text-white font-bold tracking-widest rounded-full hover:bg-white/10 transition-colors backdrop-blur-md">
                        SEE INSIDE
                    </button>
                </div>
            </div>

        </section>
    );
};

export default BookFeatureDeepDive;