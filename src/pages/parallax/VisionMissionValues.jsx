// src/components/VisionMissionValues.jsx
import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';

const VisionMissionValues = () => {
  const sectionRef = useRef(null);
  const [gsapLoaded, setGsapLoaded] = useState(false);
  const gsapRef = useRef(null);
  const ScrollTriggerRef = useRef(null);
  
  // Background Refs for Parallax Descent
  const bgLayer1Ref = useRef(null);
  const bgLayer2Ref = useRef(null);
  const bgLayer3Ref = useRef(null);
  const vignetteRef = useRef(null);

  // Content Refs
  const headerRef = useRef(null);
  const headerLightRef = useRef(null);
  const visionTextRef = useRef(null);
  const visionImageRef = useRef(null);
  const visionGlowRef = useRef(null);
  const visionLightRef = useRef(null);
  const missionTextRef = useRef(null);
  const missionImageRef = useRef(null);
  const missionGlowRef = useRef(null);
  const missionLightRef = useRef(null);
  const valuesHeaderRef = useRef(null);
  const valuesImageRef = useRef(null);
  const valuesGlowRef = useRef(null);
  const valuesLightRef = useRef(null);
  const listItemsRef = useRef([]);

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
      
      // =====================================================
      // SMOOTH CINEMATIC SCROLL EXPERIENCE
      // =====================================================
      
      const mainTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=1500", // Much shorter for easier scrolling
          scrub: 0.5, // Very responsive
          pin: true,
          anticipatePin: 1,
        }
      });

      // =====================================================
      // STAGE 1: DESCENT INTO DARKNESS (0-1s)
      // =====================================================
      mainTimeline.to(bgLayer1Ref.current, {
        yPercent: -60,
        scale: 1.3,
        duration: 1
      }, 0);

      mainTimeline.to(bgLayer2Ref.current, {
        yPercent: -40,
        scale: 1.2,
        opacity: 0.6,
        duration: 1
      }, 0);

      mainTimeline.to(bgLayer3Ref.current, {
        yPercent: -20,
        duration: 1
      }, 0);

      mainTimeline.to(vignetteRef.current, {
        opacity: 0.85,
        duration: 1
      }, 0);

      // =====================================================
      // STAGE 2: HEADER ILLUMINATION (1-2.5s)
      // =====================================================
      
      // Light appears first
      mainTimeline.fromTo(headerLightRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1.5, duration: 0.8, ease: "power2.out" },
        1
      );

      // Then header emerges into the light
      mainTimeline.fromTo(headerRef.current,
        { 
          y: 300, 
          opacity: 0, 
          scale: 0.7,
          filter: "brightness(0.2) blur(25px)"
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          filter: "brightness(1.2) blur(0px)",
          duration: 1,
          ease: "power3.out"
        },
        1.3
      );

      // =====================================================
      // STAGE 3: VISION SECTION ILLUMINATION (2.5-4.5s)
      // =====================================================
      
      // Header fades as we transition (IMPROVED VISIBILITY)
      mainTimeline.to([headerRef.current, headerLightRef.current], {
        opacity: 0.4,
        y: -80,
        scale: 0.92,
        duration: 0.5
      }, 2.5);

      // Vision light appears
      mainTimeline.fromTo(visionLightRef.current,
        { opacity: 0, scale: 0.3 },
        { opacity: 1, scale: 1.8, duration: 0.8, ease: "power2.out" },
        2.8
      );

      // Vision text illuminates
      mainTimeline.fromTo(visionTextRef.current,
        { y: 250, opacity: 0, scale: 0.85, filter: "blur(20px) brightness(0.2)" },
        { y: 0, opacity: 1, scale: 1, filter: "blur(0px) brightness(1.3)", duration: 0.8, ease: "power3.out" },
        3
      );
      
      // Vision image emerges into light
      mainTimeline.fromTo(visionImageRef.current,
        { y: 300, opacity: 0, scale: 0.75, rotationX: 35 },
        { y: 0, opacity: 1, scale: 1, rotationX: 0, duration: 1, ease: "power3.out" },
        3.2
      );

      mainTimeline.fromTo(visionGlowRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 0.9, scale: 1.4, duration: 1 },
        3.2
      );

      // =====================================================
      // STAGE 4: MISSION SECTION ILLUMINATION (4.5-6.5s)
      // =====================================================
      
      // Vision fades as mission appears (IMPROVED VISIBILITY)
      mainTimeline.to([visionTextRef.current, visionImageRef.current, visionLightRef.current], {
        opacity: 0.35,
        y: -80,
        scale: 0.92,
        duration: 0.5
      }, 4.5);

      // Mission light appears
      mainTimeline.fromTo(missionLightRef.current,
        { opacity: 0, scale: 0.3 },
        { opacity: 1, scale: 1.8, duration: 0.8, ease: "power2.out" },
        4.8
      );

      // Mission image emerges first
      mainTimeline.fromTo(missionImageRef.current,
        { y: 300, opacity: 0, scale: 0.75, rotationX: 35 },
        { y: 0, opacity: 1, scale: 1, rotationX: 0, duration: 1, ease: "power3.out" },
        5
      );

      mainTimeline.fromTo(missionGlowRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 0.9, scale: 1.4, duration: 1 },
        5
      );

      // Mission text follows
      mainTimeline.fromTo(missionTextRef.current,
        { y: 250, opacity: 0, scale: 0.85, filter: "blur(20px) brightness(0.2)" },
        { y: 0, opacity: 1, scale: 1, filter: "blur(0px) brightness(1.3)", duration: 0.8, ease: "power3.out" },
        5.2
      );

      // =====================================================
      // STAGE 5: VALUES SECTION ILLUMINATION (6.5-9s)
      // =====================================================
      
      // Mission fades (IMPROVED VISIBILITY)
      mainTimeline.to([missionTextRef.current, missionImageRef.current, missionLightRef.current], {
        opacity: 0.35,
        y: -80,
        scale: 0.92,
        duration: 0.5
      }, 6.5);

      // Values light appears - biggest and brightest
      mainTimeline.fromTo(valuesLightRef.current,
        { opacity: 0, scale: 0.3 },
        { opacity: 1, scale: 2.2, duration: 1, ease: "power2.out" },
        6.8
      );

      // Values header illuminates
      mainTimeline.fromTo(valuesHeaderRef.current,
        { y: 250, opacity: 0, filter: "blur(20px) brightness(0.2)" },
        { y: 0, opacity: 1, filter: "blur(0px) brightness(1.3)", duration: 0.8, ease: "power3.out" },
        7
      );

      // Values image emerges
      mainTimeline.fromTo(valuesImageRef.current,
        { y: 300, opacity: 0, scale: 0.75 },
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out" },
        7.3
      );

      mainTimeline.fromTo(valuesGlowRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 0.9, scale: 1.4, duration: 1 },
        7.3
      );

      // Values list items illuminate one by one
      mainTimeline.fromTo(listItemsRef.current,
        { y: 150, opacity: 0, rotationY: -20, filter: "brightness(0.3)" },
        { 
          y: 0, 
          opacity: 1, 
          rotationY: 0, 
          filter: "brightness(1.2)", 
          duration: 0.8, 
          stagger: 0.2,
          ease: "power3.out"
        },
        7.8
      );

      // =====================================================
      // CONTINUOUS ANIMATIONS
      // =====================================================
      
      // All lights pulse continuously
      [headerLightRef, visionLightRef, missionLightRef, valuesLightRef].forEach((lightRef, idx) => {
        gsap.to(lightRef.current, {
          scale: `+=0.15`,
          opacity: "+=0.1",
          duration: 3 + idx * 0.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      });

      // Header glow pulse
      gsap.to(headerRef.current, {
        textShadow: "0 0 50px rgba(251, 191, 36, 0.7), 0 0 100px rgba(251, 191, 36, 0.3)",
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      
      // Images float
      gsap.to(visionImageRef.current, {
        y: -12,
        duration: 4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap.to(missionImageRef.current, {
        y: -12,
        duration: 4.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap.to(valuesImageRef.current, {
        y: -10,
        duration: 5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      // Glows breathe
      [visionGlowRef, missionGlowRef, valuesGlowRef].forEach((glowRef, idx) => {
        gsap.to(glowRef.current, {
          opacity: 1,
          scale: 1.5,
          duration: 3 + idx * 0.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });

      // Rotating diamonds
      listItemsRef.current.forEach((item) => {
        const diamond = item?.querySelector('.value-diamond');
        if (diamond) {
          gsap.to(diamond, {
            rotation: 360,
            duration: 10,
            repeat: -1,
            ease: "none"
          });
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, [gsapLoaded]);

  const addToRefs = (el) => {
    if (el && !listItemsRef.current.includes(el)) {
      listItemsRef.current.push(el);
    }
  };

  // Enhanced Image Container with WebP optimization
  const ImageContainer = ({ src, alt, customRef, glowRef, className = "" }) => {
    // Convert image path to WebP optimized versions
    // Handle both /images/ and /images-webp/ paths
    const basePath = src
      .replace(/^\/images-webp\//, '/images-optimized/')
      .replace(/^\/images\//, '/images-optimized/')
      .replace(/\.(png|jpg|jpeg|webp)$/i, '');

    return (
      <div className={`relative ${className}`}>
        <div
          ref={glowRef}
          className="absolute -inset-8 bg-gradient-radial from-amber-500/50 via-orange-600/30 to-transparent rounded-full blur-3xl"
        />

        <div
          ref={customRef}
          className="relative rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.9)] border-2 border-orange-900/40 will-change-transform"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'translateZ(0)'
          }}
        >
          <div className="absolute inset-0 z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.95)] pointer-events-none" />

          <div className="absolute inset-0 z-20 opacity-30 pointer-events-none mix-blend-overlay">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-amber-500/20 to-transparent animate-light-ray" />
          </div>

          <div className="absolute inset-0 z-30 hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-400/10 to-transparent animate-shimmer" />
          </div>

          <picture>
            <source
              type="image/webp"
              srcSet={`${basePath}-400w.webp 400w,
                      ${basePath}-800w.webp 800w,
                      ${basePath}-1200w.webp 1200w,
                      ${basePath}-1920w.webp 1920w`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
            />
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </picture>
        </div>
      </div>
    );
  };

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full min-h-screen py-48 px-6 overflow-hidden bg-[#0a0503]"
    >
      {/* ========================================= BACKGROUNDS ========================================= */}
      
      <div 
        ref={bgLayer1Ref} 
        className="absolute inset-0 z-0 pointer-events-none scale-125 will-change-transform"
      >
        <img 
          src="/images-webp/vision-background.webp"
          alt="Deep underground cavern" 
          className="w-full h-full object-cover brightness-[0.3] blur-sm"
        />
      </div>

      <div
        ref={bgLayer2Ref}
        className="absolute inset-0 z-0 opacity-40 pointer-events-none scale-115 will-change-transform mix-blend-hard-light"
      >
        <img
          src="/images-webp/parchment-vrindavan.webp"
          alt="Mystical atmosphere"
          className="w-full h-full object-cover brightness-[0.5] saturate-150"
        />
      </div>

      <div
        ref={bgLayer3Ref}
        className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none will-change-transform"
        style={{
          backgroundImage: 'url("/images-webp/texture-pattern.webp")',
          backgroundRepeat: 'repeat',
          backgroundSize: '500px'
        }}
      />

      <div className="absolute inset-0 z-1 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-500/30 rounded-full animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 20}s`
            }}
          />
        ))}
      </div>

      <div 
        ref={vignetteRef}
        className="absolute inset-0 z-2 pointer-events-none opacity-70"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.9) 100%)'
        }}
      />

      {/* Light refs for animations */}
      <div ref={headerLightRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/20 rounded-full blur-[150px] z-5 pointer-events-none" />
      <div ref={visionLightRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/20 rounded-full blur-[150px] z-5 pointer-events-none opacity-0" />
      <div ref={missionLightRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/20 rounded-full blur-[150px] z-5 pointer-events-none opacity-0" />
      <div ref={valuesLightRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-amber-500/20 rounded-full blur-[180px] z-5 pointer-events-none opacity-0" />

      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-black via-black/70 to-transparent z-3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-black via-black/70 to-transparent z-3 pointer-events-none" />

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] z-1 pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-amber-700/10 rounded-full blur-[120px] z-1 pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      {/* ========================================= CONTENT ========================================= */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-52">
        
        {/* --- HEADER --- */}
        <header className="text-center space-y-10 max-w-4xl mx-auto relative">
          <div ref={headerRef} className="relative">
            <div className="inline-flex items-center gap-3 px-6 py-2 border border-white/40 rounded-full text-xs font-serif tracking-[0.3em] text-white/80 uppercase backdrop-blur-sm bg-white/10">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Sacred Foundation
            </div>
            <h2 className="text-6xl md:text-8xl font-serif text-white mt-8">
              The Light Beneath
            </h2>
            <p className="text-2xl md:text-4xl font-light text-white/95 italic font-serif leading-relaxed mt-6">
              We dig deep to unearth the wisdom<br />that shapes souls, not just minds.
            </p>
          </div>
        </header>

        {/* --- VISION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center relative">
          <article ref={visionTextRef} className="space-y-10 text-center lg:text-left order-2 lg:order-1 relative z-10">
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-white/60" />
              <h3 className="text-xs font-bold tracking-[0.3em] text-white/80 uppercase">
                Our Vision
              </h3>
            </div>
            <h4 className="text-5xl md:text-6xl font-serif text-white leading-tight">
              Roots That Reach<br />Into Eternity
            </h4>
            <p className="text-2xl text-white/90 font-light leading-relaxed font-serif">
              We envision children growing with stories so profound, they become the bedrock of character. Ancient wisdom isn't a relic—it's a living foundation that holds steady when the world shakes.
            </p>
            <p className="text-xl text-white/85 font-light leading-relaxed italic">
              Every child deserves tales that teach them who they truly are.
            </p>
          </article>
          <div className="order-1 lg:order-2 max-w-xl mx-auto lg:max-w-none w-full relative z-10">
            <ImageContainer 
              customRef={visionImageRef}
              glowRef={visionGlowRef}
              src="/images-webp/vision-child-reading.webp"
              alt="Child discovering ancient wisdom"
              className="aspect-[4/5]"
            />
          </div>
        </div>

        {/* --- MISSION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center relative">
          <div className="max-w-xl mx-auto lg:max-w-none w-full relative z-10">
            <ImageContainer 
              customRef={missionImageRef}
              glowRef={missionGlowRef}
              src="/images-webp/Sacred_book_glowing.webp"
              alt="Sacred texts illuminated"
              className="aspect-square"
            />
          </div>
          <article ref={missionTextRef} className="space-y-10 text-center lg:text-left relative z-10">
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-white/60" />
              <h3 className="text-xs font-bold tracking-[0.3em] text-white/80 uppercase">
                Our Mission
              </h3>
            </div>
            <h4 className="text-5xl md:text-6xl font-serif text-white leading-tight">
              Translating the<br />Untranslatable
            </h4>
            <p className="text-2xl text-white/90 font-light leading-relaxed font-serif">
              We take texts that have guided millions for millennia—the Bhagavad Gita, the Ramayana, the Upanishads—and distill their essence for young hearts. Not simplified. <em>Clarified.</em>
            </p>
            <p className="text-xl text-white/85 font-light leading-relaxed italic">
              Sacred doesn't mean distant. It means deeply, powerfully present.
            </p>
          </article>
        </div>

        {/* --- VALUES --- */}
        <article className="space-y-20 text-center max-w-6xl mx-auto pb-32 relative">
          <div ref={valuesHeaderRef} className="space-y-8 relative z-10">
            <div className="flex items-center gap-6 justify-center">
              <span className="h-px w-20 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              <h3 className="text-xs font-bold tracking-[0.3em] text-white/80 uppercase">
                Core Values
              </h3>
              <span className="h-px w-20 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
            <p className="text-3xl text-white/95 font-light leading-relaxed mx-auto font-serif max-w-4xl">
              These principles are carved into everything we create—<br />like foundations laid in stone beneath a temple.
            </p>
          </div>

          <div className="flex justify-center relative z-10">
            <ImageContainer 
              customRef={valuesImageRef}
              glowRef={valuesGlowRef}
              src="/images-webp/Lotus_and_Diya_on_altar.webp"
              alt="Sacred altar with eternal flame"
              className="aspect-video w-full max-w-3xl"
            />
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-3 gap-16 px-4 md:px-12 pt-12 relative z-10">
            {[
              { name: 'Satya', english: 'Truth', desc: 'No sugarcoating. No shortcuts. Only what endures.' },
              { name: 'Daya', english: 'Compassion', desc: 'Every word written with love for young souls.' },
              { name: 'Jigyasa', english: 'Curiosity', desc: 'We spark questions that last a lifetime.' }
            ].map((value, index) => (
              <li 
                key={index}
                ref={addToRefs}
                className="flex flex-col items-center gap-6 group cursor-pointer"
              >
                <div className="relative">
                  <div className="w-6 h-6 rotate-45 bg-white/50 blur-xl absolute inset-0 animate-pulse" />
                  <span className="value-diamond w-6 h-6 rotate-45 bg-gradient-to-br from-white via-gray-200 to-gray-300 block relative z-10 group-hover:scale-[2] transition-all duration-700 shadow-[0_0_30px_rgba(255,255,255,0.6)]" />
                </div>
                <div className="space-y-3">
                  <span className="text-4xl md:text-5xl font-serif text-white tracking-wide block group-hover:text-white/90 transition-colors duration-500">
                    {value.name}
                  </span>
                  <span className="block text-lg text-white/80 font-light tracking-wider">
                    {value.english}
                  </span>
                  <p className="text-base text-white/75 font-light italic max-w-xs mx-auto leading-relaxed">
                    {value.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </article>

      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(30deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(30deg); }
        }
        
        @keyframes light-ray {
          0%, 100% { transform: translateY(-10%); opacity: 0.2; }
          50% { transform: translateY(10%); opacity: 0.4; }
        }
        
        @keyframes float-particle {
          0%, 100% { 
            transform: translate(0, 0); 
            opacity: 0.3;
          }
          50% { 
            transform: translate(50px, -100px); 
            opacity: 0.8;
          }
        }
        
        .animate-shimmer {
          animation: shimmer 4s infinite;
        }
        
        .animate-light-ray {
          animation: light-ray 8s infinite ease-in-out;
        }
        
        .animate-float-particle {
          animation: float-particle linear infinite;
        }
      `}</style>
    </section>
  );
};

export default VisionMissionValues;