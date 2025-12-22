// src/components/VisionMissionValues.jsx
import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const VisionMissionValues = () => {
  const sectionRef = useRef(null);
  
  // Background Refs for Parallax Descent
  const bgLayer1Ref = useRef(null);
  const bgLayer2Ref = useRef(null);
  const bgLayer3Ref = useRef(null);
  const vignetteRef = useRef(null);

  // Content Refs
  const headerRef = useRef(null);
  const visionTextRef = useRef(null);
  const visionImageRef = useRef(null);
  const visionGlowRef = useRef(null);
  const missionTextRef = useRef(null);
  const missionImageRef = useRef(null);
  const missionGlowRef = useRef(null);
  const valuesHeaderRef = useRef(null);
  const valuesImageRef = useRef(null);
  const valuesGlowRef = useRef(null);
  const listItemsRef = useRef([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      
      // =====================================================
      // PINNED UNDERGROUND DESCENT - Scroll Jacking
      // =====================================================
      
      const mainTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=1500", // Even shorter - less scrolling needed
          scrub: 0.3,
          pin: true,
          anticipatePin: 1,
        }
      });

      // STAGE 1: Initial descent into darkness (faster)
      mainTimeline.to(bgLayer1Ref.current, {
        yPercent: -80,
        scale: 1.4,
        duration: 0.8
      }, 0);

      mainTimeline.to(bgLayer2Ref.current, {
        yPercent: -50,
        scale: 1.25,
        opacity: 0.5,
        duration: 0.8
      }, 0);

      mainTimeline.to(bgLayer3Ref.current, {
        yPercent: -25,
        duration: 0.8
      }, 0);

      // Vignette intensifies
      mainTimeline.to(vignetteRef.current, {
        opacity: 0.95,
        duration: 0.8
      }, 0);

      // STAGE 2: Header emerges from underground
      mainTimeline.fromTo(headerRef.current,
        { 
          y: 400, 
          opacity: 0, 
          scale: 0.6,
          filter: "brightness(0.2) blur(30px)"
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          filter: "brightness(1) blur(0px)",
          duration: 0.5,
        }, 0.2
      );

      // STAGE 3: Vision section rises (with better text visibility)
      mainTimeline.fromTo(visionTextRef.current,
        { y: 250, opacity: 0, scale: 0.85, filter: "blur(15px) brightness(0.3)" },
        { y: 0, opacity: 1, scale: 1, filter: "blur(0px) brightness(1)", duration: 0.5 }, 0.8
      );
      
      mainTimeline.fromTo(visionImageRef.current,
        { y: 350, opacity: 0, scale: 0.75, rotationX: 40 },
        { y: 0, opacity: 1, scale: 1, rotationX: 0, duration: 0.6 }, 0.9
      );

      mainTimeline.fromTo(visionGlowRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 0.8, scale: 1.2, duration: 0.6 }, 0.9
      );

      // STAGE 4: Vision fades, Mission rises (faster transition)
      mainTimeline.to([visionTextRef.current, visionImageRef.current], {
        opacity: 0.2,
        y: -80,
        scale: 0.95,
        duration: 0.3
      }, 1.5);

      mainTimeline.fromTo(missionTextRef.current,
        { y: 250, opacity: 0, scale: 0.85, filter: "blur(15px) brightness(0.3)" },
        { y: 0, opacity: 1, scale: 1, filter: "blur(0px) brightness(1)", duration: 0.5 }, 1.6
      );
      
      mainTimeline.fromTo(missionImageRef.current,
        { y: 350, opacity: 0, scale: 0.75, rotationX: 40 },
        { y: 0, opacity: 1, scale: 1, rotationX: 0, duration: 0.6 }, 1.7
      );

      mainTimeline.fromTo(missionGlowRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 0.8, scale: 1.2, duration: 0.6 }, 1.7
      );

      // STAGE 5: Mission fades, Values emerge (faster)
      mainTimeline.to([missionTextRef.current, missionImageRef.current], {
        opacity: 0.2,
        y: -80,
        scale: 0.95,
        duration: 0.3
      }, 2.3);

      mainTimeline.fromTo(valuesHeaderRef.current,
        { y: 250, opacity: 0, filter: "blur(15px) brightness(0.3)" },
        { y: 0, opacity: 1, filter: "blur(0px) brightness(1)", duration: 0.5 }, 2.4
      );

      mainTimeline.fromTo(valuesImageRef.current,
        { y: 350, opacity: 0, scale: 0.75 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6 }, 2.5
      );

      mainTimeline.fromTo(valuesGlowRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 0.8, scale: 1.2, duration: 0.6 }, 2.5
      );

      // STAGE 6: Values list items rise (faster stagger)
      mainTimeline.fromTo(listItemsRef.current,
        { y: 180, opacity: 0, rotationY: -25, filter: "brightness(0.3)" },
        { y: 0, opacity: 1, rotationY: 0, filter: "brightness(1)", duration: 0.6, stagger: 0.1 }, 3
      );

      // =====================================================
      // CONTINUOUS ANIMATIONS (after scroll completes)
      // =====================================================
      
      // Header continuous glow pulse
      gsap.to(headerRef.current, {
        textShadow: "0 0 40px rgba(251, 191, 36, 0.5), 0 0 80px rgba(251, 191, 36, 0.2)",
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      
      // Floating breath for images (plays continuously)
      gsap.to(visionImageRef.current, {
        y: -10,
        duration: 4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap.to(missionImageRef.current, {
        y: -10,
        duration: 4.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap.to(valuesImageRef.current, {
        y: -8,
        duration: 5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      // Glow breathing
      gsap.to(visionGlowRef.current, {
        opacity: 0.9,
        scale: 1.3,
        duration: 3,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap.to(missionGlowRef.current, {
        opacity: 0.9,
        scale: 1.3,
        duration: 3.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap.to(valuesGlowRef.current, {
        opacity: 0.9,
        scale: 1.3,
        duration: 4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      // =====================================================
      // MAGNETIC TILT EFFECT
      // =====================================================
      
      // Magnetic tilt for images
      const addMagneticTilt = (element) => {
        const handleMouseMove = (e) => {
          const rect = element.getBoundingClientRect();
          const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
          const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
          
          gsap.to(element, {
            rotationY: x * 15,
            rotationX: -y * 15,
            duration: 0.5,
            ease: "power2.out",
            transformPerspective: 1000,
          });
        };

        const handleMouseLeave = () => {
          gsap.to(element, {
            rotationY: 0,
            rotationX: 0,
            duration: 1.2,
            ease: "elastic.out(1, 0.6)",
          });
        };

        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseleave', handleMouseLeave);
      };

      addMagneticTilt(visionImageRef.current);
      addMagneticTilt(missionImageRef.current);
      addMagneticTilt(valuesImageRef.current);

      // Rotating diamonds
      listItemsRef.current.forEach((item) => {
        const diamond = item.querySelector('.value-diamond');
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
  }, []);

  const addToRefs = (el) => {
    if (el && !listItemsRef.current.includes(el)) {
      listItemsRef.current.push(el);
    }
  };

  // Enhanced Image Container with underground emergence feel
  const ImageContainer = ({ src, alt, customRef, glowRef, className = "" }) => (
    <div className={`relative ${className}`}>
      {/* Underground glow emanating from depths */}
      <div 
        ref={glowRef}
        className="absolute -inset-8 bg-gradient-radial from-amber-600/40 via-orange-700/20 to-transparent rounded-full blur-3xl opacity-0"
      />
      
      {/* Main image with depth */}
      <div 
        ref={customRef} 
        className="relative rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.9)] border-2 border-orange-900/40 will-change-transform"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: 'translateZ(0)'
        }}
      >
        {/* Deep inner shadow for underground feeling */}
        <div className="absolute inset-0 z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.95)] pointer-events-none" />
        
        {/* Light rays emerging from image */}
        <div className="absolute inset-0 z-20 opacity-30 pointer-events-none mix-blend-overlay">
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-amber-500/20 to-transparent animate-light-ray" />
        </div>
        
        {/* Shimmer overlay on hover */}
        <div className="absolute inset-0 z-30 opacity-0 hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-400/10 to-transparent animate-shimmer" />
        </div>
        
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full min-h-screen py-48 px-6 overflow-hidden bg-[#0a0503]"
    >
      {/* ========================================= UNDERGROUND BACKGROUNDS ========================================= */}
      
      {/* Layer 1: Deepest underground cavern */}
      <div 
        ref={bgLayer1Ref} 
        className="absolute inset-0 z-0 pointer-events-none scale-125 will-change-transform"
      >
        <img 
          src="/images/vision-background.png"
          alt="Deep underground cavern" 
          className="w-full h-full object-cover brightness-[0.25] blur-sm"
        />
      </div>

      {/* Layer 2: Middle atmospheric layer */}
      <div 
        ref={bgLayer2Ref}
        className="absolute inset-0 z-0 opacity-30 pointer-events-none scale-115 will-change-transform mix-blend-hard-light"
      >
        <img 
          src="/images/vrindavan-layer-3.png"
          alt="Mystical atmosphere" 
          className="w-full h-full object-cover brightness-[0.4] saturate-150"
        />
      </div>

      {/* Layer 3: Foreground texture (closest to viewer) */}
      <div 
        ref={bgLayer3Ref}
        className="absolute inset-0 z-0 opacity-10 mix-blend-overlay pointer-events-none will-change-transform"
        style={{ 
          backgroundImage: 'url("/images/image_4.png")',
          backgroundRepeat: 'repeat',
          backgroundSize: '500px' 
        }}
      />

      {/* Floating particles simulating dust in underground chamber */}
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

      {/* Dark vignette that intensifies as we go deeper */}
      <div 
        ref={vignetteRef}
        className="absolute inset-0 z-2 pointer-events-none opacity-70"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.9) 100%)'
        }}
      />

      {/* Top and bottom darkness gradients */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-black via-black/70 to-transparent z-3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-black via-black/70 to-transparent z-3 pointer-events-none" />

      {/* Ambient underground glow spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] z-1 pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-amber-700/10 rounded-full blur-[120px] z-1 pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      {/* ========================================= CONTENT ========================================= */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-52">
        
        {/* --- HEADER --- */}
        <header ref={headerRef} className="text-center space-y-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-3 px-6 py-2 border border-amber-400/30 rounded-full text-xs font-serif tracking-[0.3em] text-amber-300/70 uppercase backdrop-blur-sm bg-black/30">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            Sacred Foundation
          </div>
          <h2 className="text-6xl md:text-8xl font-serif text-amber-50 drop-shadow-[0_0_60px_rgba(251,191,36,0.3)]">
            The Light Beneath
          </h2>
          <p className="text-2xl md:text-4xl font-light text-amber-100/80 italic font-serif leading-relaxed">
            We dig deep to unearth the wisdom<br />that shapes souls, not just minds.
          </p>
        </header>

        {/* --- VISION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">
          <article ref={visionTextRef} className="space-y-10 text-center lg:text-left order-2 lg:order-1">
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-orange-500" />
              <h3 className="text-xs font-bold tracking-[0.3em] text-orange-400 uppercase">
                Our Vision
              </h3>
            </div>
            <h4 className="text-5xl md:text-6xl font-serif text-amber-50 leading-tight">
              Roots That Reach<br />Into Eternity
            </h4>
            <p className="text-2xl text-stone-200/90 font-light leading-relaxed font-serif">
              We envision children growing with stories so profound, they become the bedrock of character. Ancient wisdom isn't a relic—it's a living foundation that holds steady when the world shakes.
            </p>
            <p className="text-xl text-stone-300/70 font-light leading-relaxed italic">
              Every child deserves tales that teach them who they truly are.
            </p>
          </article>
          <div className="order-1 lg:order-2 max-w-xl mx-auto lg:max-w-none w-full">
            <ImageContainer 
              customRef={visionImageRef}
              glowRef={visionGlowRef}
              src="/images/vision-child-reading.png"
              alt="Child discovering ancient wisdom"
              className="aspect-[4/5]"
            />
          </div>
        </div>

        {/* --- MISSION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">
          <div className="max-w-xl mx-auto lg:max-w-none w-full">
            <ImageContainer 
              customRef={missionImageRef}
              glowRef={missionGlowRef}
              src="/images/Sacred_book_glowing.png"
              alt="Sacred texts illuminated"
              className="aspect-square"
            />
          </div>
          <article ref={missionTextRef} className="space-y-10 text-center lg:text-left">
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-orange-500" />
              <h3 className="text-xs font-bold tracking-[0.3em] text-orange-400 uppercase">
                Our Mission
              </h3>
            </div>
            <h4 className="text-5xl md:text-6xl font-serif text-amber-50 leading-tight">
              Translating the<br />Untranslatable
            </h4>
            <p className="text-2xl text-stone-200/90 font-light leading-relaxed font-serif">
              We take texts that have guided millions for millennia—the Bhagavad Gita, the Ramayana, the Upanishads—and distill their essence for young hearts. Not simplified. <em>Clarified.</em>
            </p>
            <p className="text-xl text-stone-300/70 font-light leading-relaxed italic">
              Sacred doesn't mean distant. It means deeply, powerfully present.
            </p>
          </article>
        </div>

        {/* --- VALUES --- */}
        <article className="space-y-20 text-center max-w-6xl mx-auto pb-32">
          <div ref={valuesHeaderRef} className="space-y-8">
            <div className="flex items-center gap-6 justify-center">
              <span className="h-px w-20 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
              <h3 className="text-xs font-bold tracking-[0.3em] text-orange-400 uppercase">
                Core Values
              </h3>
              <span className="h-px w-20 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
            </div>
            <p className="text-3xl text-stone-200/90 font-light leading-relaxed mx-auto font-serif max-w-4xl">
              These principles are carved into everything we create—<br />like foundations laid in stone beneath a temple.
            </p>
          </div>

          <div className="flex justify-center">
            <ImageContainer 
              customRef={valuesImageRef}
              glowRef={valuesGlowRef}
              src="/images/Lotus_and_Diya_on_altar.png"
              alt="Sacred altar with eternal flame"
              className="aspect-video w-full max-w-3xl"
            />
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-3 gap-16 px-4 md:px-12 pt-12">
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
                  {/* Glowing base */}
                  <div className="w-6 h-6 rotate-45 bg-orange-500/50 blur-xl absolute inset-0 animate-pulse" />
                  {/* Diamond */}
                  <span className="value-diamond w-6 h-6 rotate-45 bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 block relative z-10 group-hover:scale-[2] transition-all duration-700 shadow-[0_0_30px_rgba(251,191,36,0.6)]" />
                </div>
                <div className="space-y-3">
                  <span className="text-4xl md:text-5xl font-serif text-amber-50 tracking-wide drop-shadow-lg block group-hover:text-amber-200 transition-colors duration-500">
                    {value.name}
                  </span>
                  <span className="block text-lg text-orange-300/70 font-light tracking-wider">
                    {value.english}
                  </span>
                  <p className="text-base text-stone-300/60 font-light italic max-w-xs mx-auto leading-relaxed">
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