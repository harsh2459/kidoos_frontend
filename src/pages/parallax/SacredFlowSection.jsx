// src/components/SacredFlowSection.jsx
import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';

const SacredFlowSection = () => {
    const containerRef = useRef(null);
    const [gsapLoaded, setGsapLoaded] = useState(false);
    const gsapRef = useRef(null);
    const ScrollTriggerRef = useRef(null);

    // GROUPS
    const brightGroupRef = useRef(null); // The Video Layer (Foreground)
    const backgroundTextRef = useRef(null); // The Text Layer (Background)
    const middleGroupRef = useRef(null); 
    const darkGroupRef = useRef(null);

    // VIDEO WRAPPER
    const videoWrapperRef = useRef(null);

    // ELEMENTS - START
    const darkRootsRef = useRef(null);
    const darkTitleRef = useRef(null);
    const darkSubtitleRef = useRef(null);

    // ELEMENTS - MIDDLE
    const mistRef = useRef(null);
    const rippleRef = useRef(null);
    const middleTextRef = useRef(null);
    const middleSubtitleRef = useRef(null);

    // ELEMENTS - END
    const videoRef = useRef(null);
    const videoTextRef = useRef(null); // Text INSIDE video
    const finalTextRef = useRef(null); // Text BEHIND video
    const videoOverlayRef = useRef(null); // Dark overlay for video

    const lanternRef = useRef(null);

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

    // MOUSE EFFECT
    useEffect(() => {
        if (!gsapLoaded || !gsapRef.current) return;

        const gsap = gsapRef.current;

        const xTo = gsap.quickTo(lanternRef.current, "x", { duration: 0.6, ease: "power3" });
        const yTo = gsap.quickTo(lanternRef.current, "y", { duration: 0.6, ease: "power3" });

        const handleMouseMove = (e) => {
            xTo(e.clientX);
            yTo(e.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [gsapLoaded]);

    useLayoutEffect(() => {
        if (!gsapLoaded || !gsapRef.current || !ScrollTriggerRef.current) return;

        const gsap = gsapRef.current;
        const ScrollTrigger = ScrollTriggerRef.current;

        const ctx = gsap.context(() => {

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "+=5000", 
                    scrub: 1,      
                    pin: true,
                }
            });

            // --- INITIAL STATES ---
            gsap.set(darkRootsRef.current, { scale: 1.0, filter: "brightness(0.8)" });
            gsap.set(darkTitleRef.current, { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" });
            gsap.set(darkSubtitleRef.current, { opacity: 1, y: 0 });

            gsap.set(middleGroupRef.current, { opacity: 0 });
            gsap.set(rippleRef.current, { scale: 0.3, opacity: 0, rotation: 0 });
            gsap.set(middleTextRef.current, { opacity: 0, y: 100, scale: 0.9 });
            gsap.set(middleSubtitleRef.current, { opacity: 0, y: 80 });

            // VIDEO STATE (Foreground)
            gsap.set(brightGroupRef.current, { opacity: 0, pointerEvents: "none" });
            gsap.set(videoWrapperRef.current, { 
                scale: 1.5,           
                width: "100%", 
                height: "100%", 
                borderRadius: "0px",
                boxShadow: "0px 0px 0px rgba(0,0,0,0)"
            });
            gsap.set(videoRef.current, { filter: "blur(20px)" }); 
            gsap.set(videoTextRef.current, { opacity: 1, scale: 1 }); // Text starts visible IN video
            gsap.set(videoOverlayRef.current, { opacity: 0 }); // No overlay initially

            // BACKGROUND TEXT STATE (Hidden behind video initially)
            gsap.set(backgroundTextRef.current, { opacity: 1, zIndex: 0 }); 
            gsap.set(finalTextRef.current, { 
                scale: 1.2, // Starts slightly larger
                opacity: 0  // Starts hidden
            });

            // === PHASE 1: UNDERGROUND (0-20%) ===
            tl.to(darkRootsRef.current, { scale: 1.3, filter: "brightness(0.6)", duration: 2 }, 0);
            tl.to(darkTitleRef.current, { opacity: 0, scale: 1.15, y: -80, filter: "blur(15px)", duration: 1.8 }, 0.5);
            tl.to(darkSubtitleRef.current, { opacity: 0, y: -60, duration: 1.5 }, 0.7);

            // === PHASE 2: EMERGENCE (20-50%) ===
            tl.to(middleGroupRef.current, { opacity: 1, duration: 2 }, 1.5);
            tl.to(darkRootsRef.current, { opacity: 0, duration: 2.5 }, 1.8);
            tl.to(rippleRef.current, { scale: 2.5, opacity: 0.5, rotation: 180, duration: 3 }, 2);
            
            tl.fromTo(middleTextRef.current, { opacity: 0, y: 100, scale: 0.9, filter: "blur(15px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 2.2 }, 2.5);
            tl.fromTo(middleSubtitleRef.current, { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 2 }, 2.8);

            tl.to(middleTextRef.current, { opacity: 0, y: -100, filter: "blur(10px)", duration: 1.8 }, 5.0);
            tl.to(middleSubtitleRef.current, { opacity: 0, y: -80, duration: 1.6 }, 5.1);
            tl.to(middleGroupRef.current, { opacity: 0, duration: 2 }, 5.5);

            // === PHASE 3: THE REVELATION & TRANSFORMATION (50-100%) ===
            
            // 1. Reveal Video Layer (Full Screen)
            tl.to(brightGroupRef.current, { opacity: 1, pointerEvents: "auto", duration: 1.5 }, 5.5);
            
            // 2. Unblur Video & Show Text INSIDE video
            tl.to(videoWrapperRef.current, { scale: 1, duration: 2.5, ease: "power2.out" }, 5.5);
            tl.to(videoRef.current, { filter: "blur(0px)", duration: 2.5 }, 5.5);
            
            // Small pause - let viewer see the text in video
            
            // 3. CROSSFADE: Text transitions from INSIDE video to BACKGROUND
            // As video shrinks, text inside fades out while background text fades in
            tl.to(videoTextRef.current, { 
                opacity: 0, 
                scale: 1.15,
                duration: 3,
                ease: "power2.inOut"
            }, 8.0);
            
            // Darken video slightly as it shrinks
            tl.to(videoOverlayRef.current, {
                opacity: 0.35,
                duration: 3,
                ease: "power2.inOut"
            }, 8.0);

            // 4. SHRINK VIDEO (floats over background text)
            tl.to(videoWrapperRef.current, { 
                scale: 0.65,
                borderRadius: "40px",
                duration: 3.5,
                ease: "power2.inOut",
                boxShadow: "0px 40px 80px rgba(0,0,0,0.8)"
            }, 8.0);

            // 5. REVEAL Background Text (synced with video text fadeout)
            tl.to(finalTextRef.current, {
                opacity: 1,
                scale: 1,
                duration: 3.5,
                ease: "power2.inOut"
            }, 8.0);

        }, containerRef);
        return () => ctx.revert();
    }, [gsapLoaded]);

    return (
        <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-[#0a0502] font-serif">

            {/* ========================================= */}
            {/* LAYER 0: BACKGROUND TEXT (Behind Everything) */}
            {/* ========================================= */}
            <div 
                ref={backgroundTextRef}
                className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
            >
                <div ref={finalTextRef} className="text-center px-8">
                    <h2 className="text-[14vw] leading-[0.9] text-white font-['Cinzel'] tracking-[0.15em] drop-shadow-2xl opacity-90 mb-6">
                        VRINDAVAN
                    </h2>
                    <div className="w-32 h-[3px] bg-gradient-to-r from-transparent via-amber-200/60 to-transparent mx-auto mb-8"></div>
                    <p className="text-3xl md:text-4xl text-amber-100/80 font-['Playfair_Display'] italic tracking-[0.15em] leading-relaxed max-w-4xl mx-auto">
                        Where Krishna's leela unfolds,<br />
                        Where every soul finds home
                    </p>
                    <p className="text-lg md:text-xl text-amber-200/60 font-['Cinzel'] tracking-[0.3em] mt-8 uppercase">
                        The Sacred Land · The Eternal Journey
                    </p>
                </div>
            </div>

            {/* ========================================= */}
            {/* LAYER 1: VIDEO (Foreground - Shrinks)     */}
            {/* ========================================= */}
            <div 
                ref={brightGroupRef} 
                className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
            >
                <div 
                    ref={videoWrapperRef} 
                    className="relative w-full h-full overflow-hidden origin-center bg-black"
                >
                    <video
                        ref={videoRef}
                        src="/videos/vrindavan_reveal.mp4" 
                        autoPlay 
                        muted 
                        loop 
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    
                    {/* Dark overlay that appears as video shrinks */}
                    <div ref={videoOverlayRef} className="absolute inset-0 bg-black/40 pointer-events-none"></div>
                    
                    {/* Glass Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none mix-blend-overlay"></div>
                    
                    {/* TEXT INSIDE VIDEO (fades out as video shrinks) */}
                    <div ref={videoTextRef} className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div className="text-center px-8">
                            <h2 className="text-[14vw] leading-[0.9] text-white font-['Cinzel'] tracking-[0.15em] drop-shadow-[0_0_40px_rgba(0,0,0,0.9)] mb-6">
                                VRINDAVAN
                            </h2>
                            <div className="w-32 h-[3px] bg-gradient-to-r from-transparent via-white/80 to-transparent mx-auto mb-8"></div>
                            <p className="text-3xl md:text-4xl text-white/95 font-['Playfair_Display'] italic tracking-[0.15em] drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] leading-relaxed max-w-4xl mx-auto">
                                Where Krishna's leela unfolds,<br />
                                Where every soul finds home
                            </p>
                            <p className="text-lg md:text-xl text-white/80 font-['Cinzel'] tracking-[0.3em] mt-8 uppercase drop-shadow-[0_0_15px_rgba(0,0,0,0.9)]">
                                The Sacred Land · The Eternal Journey
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* LAYER 2: MIDDLE WORLD (Mist)              */}
            {/* ========================================= */}
            <div ref={middleGroupRef} className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                <img ref={mistRef} src="/images-webp/illustration-water-ripple.webp" alt="Mist" className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-40" />
                <img ref={rippleRef} src="/images-webp/texture-parchment-wash.webp" alt="Ripple" className="absolute w-[90%] md:w-[70%] h-auto object-contain mix-blend-overlay opacity-50" />

                <div className="relative z-30 text-center p-8 max-w-5xl">
                    <div ref={middleTextRef} className="mb-8">
                        <h3 className="text-6xl md:text-8xl text-[#f5e6d3] mb-8 font-['Cinzel'] tracking-[0.1em]">
                            THE AWAKENING
                        </h3>
                        <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-amber-200/80 to-transparent mx-auto my-8"></div>
                    </div>
                    <div ref={middleSubtitleRef}>
                        <p className="text-2xl md:text-4xl text-[#e6dcc3] font-['Playfair_Display'] leading-relaxed mb-6">
                            From the battlefield of Kurukshetra,<br />
                            Through the sacred verses of the Gita,<br />
                            We journey to where it all began
                        </p>
                        <p className="text-xl md:text-2xl text-amber-200/70 italic font-['Playfair_Display'] mt-8">
                            The land where Krishna walked,<br />
                            Where devotion becomes destiny
                        </p>
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* LAYER 3: DARK WORLD (Underground)          */}
            {/* ========================================= */}
            <div ref={darkGroupRef} className="absolute inset-0 z-40 pointer-events-none">
                <div ref={lanternRef} className="fixed top-0 left-0 z-50 mix-blend-soft-light pointer-events-none">
                    <div className="absolute transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.15)_0%,transparent_70%)] blur-3xl" />
                </div>
                <div ref={darkRootsRef} className="absolute inset-0 w-full h-full">
                    <img src="/images-webp/Dark_background.webp" alt="Underground darkness" className="w-full h-full object-cover brightness-[0.8] sepia-[0.2]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-40 p-6">
                    <div ref={darkTitleRef} className="mb-10">
                        <h1 className="text-7xl md:text-[11rem] text-[#f5e6d3] tracking-[0.15em] font-['Cinzel'] uppercase text-center leading-[0.9] mb-4">
                            IN THE<br />BEGINNING
                        </h1>
                        <div className="w-40 h-[2px] bg-gradient-to-r from-transparent via-amber-300/60 to-transparent mx-auto mt-8"></div>
                    </div>
                    <div ref={darkSubtitleRef} className="max-w-4xl">
                        <p className="text-[#e6dcc3] text-2xl md:text-4xl tracking-wide font-['Playfair_Display'] text-center leading-relaxed mb-6">
                            There was darkness, confusion, despair
                        </p>
                        <p className="text-amber-200/60 text-xl md:text-2xl italic font-['Playfair_Display'] text-center leading-relaxed">
                            Arjuna stood paralyzed on the battlefield,<br />
                            Until Krishna spoke the eternal truths<br />
                            That would illuminate all souls
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SacredFlowSection;