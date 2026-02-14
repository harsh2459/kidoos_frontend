// src/components/Hero.jsx
import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import OptimizedImage from '../../components/OptimizedImage';

const Hero = () => {
  const containerRef = useRef(null);
  const [gsapLoaded, setGsapLoaded] = useState(false);
  const gsapRef = useRef(null);
  const ScrollTriggerRef = useRef(null);
  const bgRef = useRef(null);      // The main temple image
  const fgRef = useRef(null);      // The "cutout" (optional but recommended)
  const titleRef = useRef(null);   // "KIDDOS INTELLECT"
  const overlayRef = useRef(null); // The black darkening layer
  const contentRef = useRef(null); // The "Welcome" text section

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
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=2000", // Determines how long the scroll lasts
          scrub: 1,      // Smooth scrubbing
          pin: true,     // Lock the screen in place while animating
        }
      });

      // --- STEP 1: ZOOM IN (The "Entering the Forest" effect) ---
      // We scale the images up to simulate walking forward
      tl.to(bgRef.current, { scale: 1.6, duration: 1, ease: "power1.inOut" }, 0);

      // The foreground moves closer/faster (if you have the cutout)
      tl.to(fgRef.current, { scale: 2.0, yPercent: 10, duration: 1, ease: "power1.inOut" }, 0);

      // --- STEP 2: HIDE THE TITLE ---
      // The main title sinks down and fades out quickly
      tl.to(titleRef.current, { y: 200, opacity: 0, duration: 0.5 }, 0);

      // --- STEP 3: DARKEN THE SCENE ---
      // Fade in the black overlay to cover the temple image
      tl.to(overlayRef.current, { opacity: 0.95, duration: 0.8 }, 0.2);

      // --- STEP 4: REVEAL CONTENT ---
      // The "Welcome" text fades in on top of the dark background
      tl.fromTo(contentRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8 },
        0.5 // Starts halfway through the scroll
      );

    }, containerRef);

    return () => ctx.revert();
  }, [gsapLoaded]);

  return (
    <div className="relative w-full">
      <section
        ref={containerRef}
        className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-[#0a0503]"
      >

        {/* === LAYER 1: BACKGROUND IMAGE === */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source
              type="image/webp"
              srcSet="/images-optimized/back-image-400w.webp 400w,
                      /images-optimized/back-image-800w.webp 800w,
                      /images-optimized/back-image-1200w.webp 1200w,
                      /images-optimized/back-image-1920w.webp 1920w"
              sizes="100vw"
            />
            <img
              ref={bgRef}
              src="/images-webp/back-image.webp"
              alt="Background"
              className="w-full h-full object-cover origin-center"
              loading="eager"
              fetchPriority="high"
            />
          </picture>
        </div>

        {/* === LAYER 2: HERO TITLE === */}
        {/* This is the text that gets "sandwiched" */}
        <h1
          ref={titleRef}
          className="relative z-10 text-center font-serif font-bold text-white uppercase tracking-widest mt-[20px]"
          style={{
            fontSize: 'clamp(3rem, 10vw, 8rem)',
            lineHeight: 1,
            textShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}
        >
          Kiddos<br />Intellect
        </h1>

        {/* === LAYER 3: FOREGROUND CUTOUT (OPTIONAL) === */}
        {/* To get the "Lun Dev" effect where text is BEHIND trees,
            you need a transparent PNG of just the temples here.
            If you don't have it, delete this div. */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <picture>
            <source
              type="image/webp"
              srcSet="/images-optimized/foreground-cutout-400w.webp 400w,
                      /images-optimized/foreground-cutout-800w.webp 800w,
                      /images-optimized/foreground-cutout-1200w.webp 1200w,
                      /images-optimized/foreground-cutout-1920w.webp 1920w"
              sizes="100vw"
            />
            <img
              ref={fgRef}
              src="/images-webp/foreground-cutout.webp"
              alt="Foreground"
              className="w-full h-full object-cover origin-center"
              loading="eager"
            />
          </picture>
        </div>

        {/* === LAYER 4: DARK OVERLAY === */}
        {/* This creates the "fade to black" effect */}
        <div
          ref={overlayRef}
          className="absolute inset-0 z-30 bg-black pointer-events-none opacity-0"
        />

        {/* === LAYER 5: NEW CONTENT === */}
        {/* THIS WAS THE PROBLEM - Missing ref={contentRef}! */}
        <div 
          ref={contentRef}
          className="absolute z-40 max-w-4xl px-6 text-center text-orange-50 opacity-0"
        >
          <h2 className="text-4xl md:text-6xl font-serif mb-6 text-orange-200 drop-shadow-2xl">
            Where Ancient Wisdom<br />Meets Childhood Wonder
          </h2>
          <p className="text-lg md:text-xl leading-relaxed text-gray-300 font-light">
            In the sacred groves of Vrindavan, stories have been passed down for thousands of years—stories of courage, compassion, and the eternal dance between the human and divine. Now, these timeless teachings find your child's hands.
            <br /><br />
            Kiddos Intellect transforms the profound wisdom of the Bhagavad Gita and Vedic traditions into enchanting tales that spark imagination and nurture the soul. Each beautifully illustrated book creates those precious moments away from screens—where parent and child journey together through stories that shaped civilizations.
            <br /><br />
            Because raising thoughtful, compassionate children isn't about adding more to their day. It's about filling their hearts with stories worth remembering.
          </p>
        </div>

      </section>
    </div>
  );
};

export default Hero;